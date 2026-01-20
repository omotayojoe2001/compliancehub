import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VAT_SCHEDULE = [
  { day: 1, time: '09:00', type: 'email', subject: 'New Month - VAT Due 21st', content: 'New month started! Your VAT is due on the 21st. Start gathering your records early.' },
  { day: 7, time: '09:00', type: 'both', subject: 'VAT Tips: Maximize Deductions', content: 'Educational: Learn which expenses are VAT deductible. Keep proper receipts for business expenses.' },
  { day: 10, time: '09:00', type: 'both', subject: 'VAT Record Keeping Guide', content: 'Educational: Organize invoices by date. Use our digital cashbook to track everything.' },
  { day: 14, time: '09:00', type: 'both', subject: 'VAT Due in 7 Days', content: 'Your VAT return is due in 7 days (21st). Start preparing now using our smart calculator.' },
  
  // Critical days - multiple notifications
  { day: 18, time: '09:00', type: 'both', subject: 'VAT Due in 3 Days - Morning', content: 'URGENT: VAT due in 3 days! File now to avoid ₦50,000 penalties.' },
  { day: 18, time: '21:00', type: 'both', subject: 'VAT Due in 3 Days - Evening', content: 'URGENT: VAT due in 3 days! Don\'t wait - file tonight.' },
  
  { day: 19, time: '09:00', type: 'both', subject: 'VAT Due in 2 Days - Morning', content: 'CRITICAL: VAT due in 2 days! Last chance to file without penalties.' },
  { day: 19, time: '21:00', type: 'both', subject: 'VAT Due in 2 Days - Evening', content: 'CRITICAL: VAT due in 2 days! File immediately.' },
  
  { day: 20, time: '09:00', type: 'both', subject: 'VAT Due TOMORROW - Morning', content: 'FINAL WARNING: VAT due TOMORROW! File today to avoid penalties.' },
  { day: 20, time: '21:00', type: 'both', subject: 'VAT Due TOMORROW - Evening', content: 'FINAL WARNING: VAT due TOMORROW! Last chance tonight.' },
  { day: 20, time: '22:00', type: 'both', subject: 'TEST - VAT Due TOMORROW - Late Night', content: 'TEST NOTIFICATION: VAT due TOMORROW! This is a test notification.' },
  
  // Due date - 3 notifications
  { day: 21, time: '09:00', type: 'both', subject: 'VAT DUE TODAY - Morning', content: 'VAT is DUE TODAY! File before midnight to avoid penalties.' },
  { day: 21, time: '18:00', type: 'both', subject: 'VAT DUE TODAY - 6 Hours Left', content: 'Only 6 hours left to file VAT! File immediately!' },
  { day: 21, time: '23:00', type: 'both', subject: 'VAT DUE - 1 HOUR LEFT!', content: '🚨 EMERGENCY: 1 HOUR LEFT to file VAT! File RIGHT NOW!' }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    
    // Use West African Time (UTC+1)
    const now = new Date()
    const watOffset = 1 * 60 * 60 * 1000 // 1 hour in milliseconds
    const watTime = new Date(now.getTime() + watOffset)
    
    let day, hour, minute, currentTime
    
    // Check if this is a force test
    if (body.forceTest) {
      day = body.testDay || 21
      const [testHour, testMinute] = (body.testTime || '09:00').split(':')
      hour = parseInt(testHour)
      minute = parseInt(testMinute)
      currentTime = body.testTime || '09:00'
    } else {
      day = watTime.getDate()
      hour = watTime.getHours()
      minute = watTime.getMinutes()
      currentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
    
    // Find scheduled notifications for current day and time (allow 60 minute window)
    const scheduledNotifications = VAT_SCHEDULE.filter(n => {
      if (n.day !== day) return false;
      
      const [schedHour, schedMinute] = n.time.split(':').map(Number);
      const schedTotalMinutes = schedHour * 60 + schedMinute;
      const currentTotalMinutes = hour * 60 + minute;
      
      // Allow 60 minute window (e.g., 21:00-22:00)
      return currentTotalMinutes >= schedTotalMinutes && currentTotalMinutes <= schedTotalMinutes + 60;
    });
    
    if (scheduledNotifications.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No notifications scheduled for this time',
        debug: {
          day: day,
          currentTime: currentTime,
          hour: hour,
          minute: minute,
          forceTest: body.forceTest || false,
          allScheduleForToday: VAT_SCHEDULE.filter(n => n.day === day),
          timeCalculation: {
            currentTotalMinutes: hour * 60 + minute,
            scheduledTimes: VAT_SCHEDULE.filter(n => n.day === day).map(n => {
              const [schedHour, schedMinute] = n.time.split(':').map(Number);
              return {
                time: n.time,
                subject: n.subject,
                schedTotalMinutes: schedHour * 60 + schedMinute,
                withinWindow: (hour * 60 + minute) >= (schedHour * 60 + schedMinute) && (hour * 60 + minute) <= (schedHour * 60 + schedMinute + 60)
              }
            })
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Get users with VAT obligations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')
    
    const obligationsRes = await fetch(`${supabaseUrl}/rest/v1/tax_obligations?obligation_type=eq.VAT&payment_status=eq.pending&is_active=eq.true&select=*,user_profiles(*)`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })
    
    const obligations = await obligationsRes.json()
    
    // For testing - send to hardcoded email if no obligations found
    if (!Array.isArray(obligations) || obligations.length === 0) {
      // Send test email directly
      try {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: 'joshuaomotayo10@gmail.com',
            subject: scheduledNotifications[0]?.subject || 'Test VAT Notification',
            html: `
              <h2>${scheduledNotifications[0]?.subject || 'Test VAT Notification'}</h2>
              <p>${scheduledNotifications[0]?.content || 'This is a test notification'}</p>
              <p><strong>Test Time:</strong> ${currentTime} on day ${day}</p>
            `
          })
        })
        
        const emailResult = await emailRes.text()
        
        return new Response(JSON.stringify({ 
          message: 'No VAT obligations found - sent test email instead',
          testEmailSent: emailRes.ok,
          emailResult: emailResult,
          debug: {
            day: day,
            currentTime: currentTime,
            scheduledNotifications: scheduledNotifications.map(n => n.subject),
            obligationsResponse: obligations
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ 
          message: 'No VAT obligations found and test email failed',
          emailError: error.message,
          debug: {
            day: day,
            currentTime: currentTime,
            scheduledNotifications: scheduledNotifications.map(n => n.subject),
            obligationsResponse: obligations
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }
    
    let sentCount = 0
    let debugInfo = []
    
    // Send notifications to each user
    for (const obligation of obligations) {
      const user = obligation.user_profiles
      
      debugInfo.push({
        obligationId: obligation.id,
        userId: obligation.user_id,
        hasUserProfile: !!user,
        userEmail: user?.email,
        userPhone: user?.phone
      })
      
      if (!user) {
        debugInfo[debugInfo.length - 1].error = 'No user profile found'
        continue
      }
      
      for (const notification of scheduledNotifications) {
        let emailSent = false
        let whatsappSent = false
        
        // Send email
        if (notification.type === 'email' || notification.type === 'both') {
          try {
            const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: user.email || obligation.user_id,
                subject: notification.subject,
                html: `
                  <h2>${notification.subject}</h2>
                  <p>${notification.content}</p>
                  <p><strong>VAT Due Date:</strong> ${new Date(obligation.next_due_date).toLocaleDateString()}</p>
                  <p><a href="https://compliance.forecourtlimited.com/obligations">View Your Obligations</a></p>
                `
              })
            })
            emailSent = emailRes.ok
            debugInfo[debugInfo.length - 1].emailResult = await emailRes.text()
          } catch (error) {
            debugInfo[debugInfo.length - 1].emailError = error.message
          }
        }
        
        // Send WhatsApp
        if (notification.type === 'whatsapp' || notification.type === 'both') {
          if (user.phone) {
            try {
              const whatsappRes = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  to: user.phone,
                  message: `${notification.subject}\n\n${notification.content}\n\nVAT Due: ${new Date(obligation.next_due_date).toLocaleDateString()}\n\nView: https://compliance.forecourtlimited.com/obligations`
                })
              })
              whatsappSent = whatsappRes.ok
              debugInfo[debugInfo.length - 1].whatsappResult = await whatsappRes.text()
            } catch (error) {
              debugInfo[debugInfo.length - 1].whatsappError = error.message
            }
          } else {
            debugInfo[debugInfo.length - 1].whatsappError = 'No phone number'
          }
        }
        
        if (emailSent || whatsappSent) {
          sentCount++
        }
      }
      
      // Log notification
      await fetch(`${supabaseUrl}/rest/v1/reminder_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: obligation.user_id,
          obligation_id: obligation.id,
          reminder_type: scheduledNotifications[0]?.type || 'both',
          scheduled_date: now.toISOString(),
          sent_date: now.toISOString(),
          status: 'sent',
          message_content: scheduledNotifications[0]?.content || 'VAT notification'
        })
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${sentCount} notifications for day ${day} at ${currentTime}`,
      obligations_count: obligations.length,
      notifications_sent: scheduledNotifications.map(n => n.subject),
      debug: {
        day: day,
        currentTime: currentTime,
        forceTest: body.forceTest || false,
        scheduledCount: scheduledNotifications.length,
        obligationsFound: obligations.length,
        userDetails: debugInfo
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})