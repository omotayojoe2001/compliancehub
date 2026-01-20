import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const now = new Date()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    // Get overdue VAT obligations
    const obligationsRes = await fetch(`${supabaseUrl}/rest/v1/tax_obligations?obligation_type=eq.VAT&payment_status=eq.overdue&is_active=eq.true&select=*,user_profiles(*)`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })
    
    const obligations = await obligationsRes.json()
    let sentCount = 0
    
    for (const obligation of obligations) {
      const user = obligation.user_profiles
      if (!user) continue
      
      const dueDate = new Date(obligation.next_due_date)
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysOverdue <= 0) continue // Not actually overdue
      
      let subject = ''
      let content = ''
      let shouldSend = false
      
      // Determine overdue message based on days
      if (daysOverdue === 1) {
        subject = 'VAT 1 Day Overdue - File Immediately'
        content = `Your VAT is 1 day overdue! File immediately to minimize penalties. Current penalty: ₦50,000+`
        shouldSend = true
      } else if (daysOverdue === 3) {
        subject = 'VAT 3 Days Overdue - Penalties Applying'
        content = `Your VAT is 3 days overdue! Penalties are accumulating. Current penalty: ₦100,000+`
        shouldSend = true
      } else if (daysOverdue === 7) {
        subject = 'VAT 1 Week Overdue - Serious Penalties'
        content = `Your VAT is 1 week overdue! Serious penalties apply. Current penalty: ₦200,000+`
        shouldSend = true
      } else if (daysOverdue === 14) {
        subject = 'VAT 2 Weeks Overdue - Contact FIRS'
        content = `Your VAT is 2 weeks overdue! Contact FIRS immediately. Current penalty: ₦500,000+`
        shouldSend = true
      } else if (daysOverdue % 7 === 0 && daysOverdue > 14) {
        // Weekly reminders after 2 weeks
        subject = `VAT ${Math.floor(daysOverdue/7)} Weeks Overdue - Critical`
        content = `Your VAT is ${daysOverdue} days overdue! File immediately or face severe consequences.`
        shouldSend = true
      }
      
      if (!shouldSend) continue
      
      // Send email
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: user.email || obligation.user_id,
          subject: subject,
          html: `
            <h2 style="color: red;">${subject}</h2>
            <p>${content}</p>
            <p><strong>Original Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
            <p><a href="https://compliance.forecourtlimited.com/obligations" style="background: red; color: white; padding: 10px; text-decoration: none;">Mark as Paid Now</a></p>
          `
        })
      })
      
      // Send WhatsApp
      if (user.phone) {
        await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: user.phone,
            message: `🚨 ${subject}\n\n${content}\n\nDue Date: ${dueDate.toLocaleDateString()}\nDays Overdue: ${daysOverdue}\n\nMark as paid: https://compliance.forecourtlimited.com/obligations`
          })
        })
      }
      
      // Update last overdue reminder
      await fetch(`${supabaseUrl}/rest/v1/tax_obligations?id=eq.${obligation.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          last_overdue_reminder: now.toISOString(),
          overdue_reminder_count: (obligation.overdue_reminder_count || 0) + 1
        })
      })
      
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
          reminder_type: 'both',
          scheduled_date: now.toISOString(),
          sent_date: now.toISOString(),
          status: 'sent',
          message_content: content
        })
      })
      
      sentCount++
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${sentCount} overdue notifications`,
      overdue_obligations: obligations.length
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