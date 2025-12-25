import { supabase } from './supabase';
import { twilioWhatsAppService } from './twilioWhatsAppService';

export const notificationService = {
  // 1. Welcome notifications (immediate)
  async sendWelcomeNotifications(email: string, businessName: string, phone?: string) {
    try {
      // Welcome Email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: '🎉 Welcome to ComplianceHub!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #2563eb; padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to ComplianceHub!</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0;">Your tax compliance assistant is ready</p>
              </div>
              <div style="padding: 40px 20px;">
                <h2 style="color: #1e293b;">Hi ${businessName}! 👋</h2>
                <p style="color: #475569;">Thank you for joining ComplianceHub! We're excited to help you never miss another tax deadline.</p>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0;">What happens next?</h3>
                  <ul style="color: #475569;">
                    <li>Complete your business profile</li>
                    <li>Add your tax obligations</li>
                    <li>Get WhatsApp & email reminders</li>
                    <li>Access our tax calculator</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://compliancehub.ng/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Your Setup</a>
                </div>
              </div>
            </div>
          `
        }
      });

      // Welcome WhatsApp
      if (phone) {
        let whatsappPhone = phone.startsWith('0') ? '+234' + phone.substring(1) : phone;
        whatsappPhone = 'whatsapp:' + whatsappPhone;
        
        await twilioWhatsAppService.sendMessage(
          whatsappPhone,
          `🎉 Welcome to ComplianceHub, ${businessName}!\n\nYour account is ready. Complete your setup to start receiving tax reminders.\n\n✅ Never miss deadlines\n✅ Avoid penalties\n✅ Stay compliant\n\nGet started: https://compliancehub.ng/dashboard`
        );
      }
    } catch (error) {
      console.error('Welcome notifications failed:', error);
    }
  },

  // 2. Follow-up notifications (30 minutes after signup)
  async sendFollowUpNotifications(email: string, businessName: string, phone?: string) {
    try {
      // Follow-up Email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: '⏰ Complete your ComplianceHub setup (2 minutes)',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #f59e0b; padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⏰ Don't forget to complete your setup!</h1>
              </div>
              <div style="padding: 30px 20px;">
                <p style="color: #374151;">Hi ${businessName},</p>
                <p style="color: #374151;">We noticed you haven't completed your business profile yet. It only takes 2 minutes!</p>
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="color: #92400e; margin: 0; font-weight: 600;">⚠️ Without completing your profile, we can't send you important deadline reminders!</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://compliancehub.ng/dashboard" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Setup Now (2 mins)</a>
                </div>
              </div>
            </div>
          `
        }
      });

      // Follow-up WhatsApp
      if (phone) {
        let whatsappPhone = phone.startsWith('0') ? '+234' + phone.substring(1) : phone;
        whatsappPhone = 'whatsapp:' + whatsappPhone;
        
        await twilioWhatsAppService.sendMessage(
          whatsappPhone,
          `⏰ Hi ${businessName}!\n\nQuick reminder: Complete your ComplianceHub setup to start receiving tax deadline alerts.\n\n⚠️ Without setup, you might miss important deadlines!\n\nTakes 2 minutes: https://compliancehub.ng/dashboard`
        );
      }
    } catch (error) {
      console.error('Follow-up notifications failed:', error);
    }
  },

  // 3. Educational notifications (2 hours after signup)
  async sendEducationalNotifications(email: string, businessName: string, phone?: string) {
    try {
      // Educational Email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: '📚 Nigerian Tax Compliance Made Simple',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #059669; padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">📚 Tax Compliance Made Simple</h1>
                <p style="color: #d1fae5; margin: 10px 0 0 0;">Everything you need to know about Nigerian business taxes</p>
              </div>
              <div style="padding: 40px 20px;">
                <p style="color: #374151;">Hi ${businessName},</p>
                <p style="color: #374151;">Nigerian tax compliance doesn't have to be scary. Here's what ComplianceHub helps you track:</p>
                <div style="margin: 30px 0;">
                  <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
                    <h3 style="color: #065f46; margin: 0 0 10px 0;">🧾 VAT (Value Added Tax)</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px;">Monthly filing required. Due 21st of following month.</p>
                  </div>
                  <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
                    <h3 style="color: #1e40af; margin: 0 0 10px 0;">👥 PAYE (Pay As You Earn)</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px;">Monthly remittance for employee taxes. Due 10th of following month.</p>
                  </div>
                  <div style="background: #fef7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #a855f7;">
                    <h3 style="color: #7c2d12; margin: 0 0 10px 0;">📋 CAC Annual Returns</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px;">Due 42 days after incorporation anniversary.</p>
                  </div>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://compliancehub.ng/dashboard" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Tracking Your Deadlines</a>
                </div>
              </div>
            </div>
          `
        }
      });

      // Educational WhatsApp
      if (phone) {
        let whatsappPhone = phone.startsWith('0') ? '+234' + phone.substring(1) : phone;
        whatsappPhone = 'whatsapp:' + whatsappPhone;
        
        await twilioWhatsAppService.sendMessage(
          whatsappPhone,
          `📚 ${businessName}, here are key Nigerian tax deadlines:\n\n📅 VAT: 21st monthly\n📅 PAYE: 10th monthly\n📅 WHT: 21st monthly\n📅 CAC: 42 days after anniversary\n\nLet ComplianceHub track these for you automatically! 🎯\n\nhttps://compliancehub.ng/dashboard`
        );
      }
    } catch (error) {
      console.error('Educational notifications failed:', error);
    }
  },

  // 4. Tax deadline reminders
  async sendTaxDeadlineReminder(email: string, businessName: string, phone: string, taxType: string, daysUntilDue: number, dueDate: string) {
    try {
      const urgencyColor = daysUntilDue <= 1 ? '#dc2626' : daysUntilDue <= 3 ? '#ea580c' : '#2563eb';
      const urgencyText = daysUntilDue <= 1 ? '🚨 URGENT' : daysUntilDue <= 3 ? '⚠️ Important' : '📅 Reminder';
      
      // Tax Reminder Email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `${urgencyText}: ${taxType} Filing Due in ${daysUntilDue} Day${daysUntilDue === 1 ? '' : 's'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: ${urgencyColor}; padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">${urgencyText}: ${taxType} Filing Due</h1>
                <p style="color: #f1f5f9; margin: 10px 0 0 0; font-size: 18px;">${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'} remaining</p>
              </div>
              <div style="padding: 30px 20px;">
                <p style="color: #374151;">Hi ${businessName},</p>
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
                  <p style="color: #991b1b; margin: 0; font-weight: 600;">
                    ${daysUntilDue <= 1 ? '🚨 File TODAY to avoid penalties!' : '⚠️ File soon to avoid penalties!'}
                  </p>
                </div>
                <p style="color: #374151;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://compliancehub.ng/dashboard" style="background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
                </div>
              </div>
            </div>
          `
        }
      });

      // Tax Reminder WhatsApp
      if (phone) {
        let whatsappPhone = phone.startsWith('0') ? '+234' + phone.substring(1) : phone;
        whatsappPhone = 'whatsapp:' + whatsappPhone;
        
        await twilioWhatsAppService.sendMessage(
          whatsappPhone,
          `${urgencyText} ${businessName}!\n\n📋 ${taxType} filing due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}\n📅 Due: ${new Date(dueDate).toLocaleDateString()}\n\n${daysUntilDue <= 1 ? '🚨 File TODAY to avoid penalties!' : '⚠️ File soon to avoid penalties!'}\n\nStay compliant! 💼`
        );
      }
    } catch (error) {
      console.error('Tax deadline reminder failed:', error);
    }
  },

  // 5. Subscription expiry reminders
  async sendSubscriptionExpiryReminder(email: string, businessName: string, phone: string, planType: string, daysUntilExpiry: number) {
    try {
      let subject = '';
      let emailContent = '';
      let whatsappMessage = '';
      
      if (daysUntilExpiry === 7) {
        subject = '⏰ Your ComplianceHub subscription expires in 7 days';
        emailContent = `
          <h2>Hi ${businessName}!</h2>
          <p>Your <strong>${planType.toUpperCase()}</strong> plan expires in 7 days.</p>
          <p>Don't miss your tax deadlines! Renew now to continue receiving:</p>
          <ul>
            <li>✅ Automated tax deadline reminders</li>
            <li>✅ Compliance guides and calculators</li>
            <li>✅ Peace of mind for your business</li>
          </ul>
          <p><a href="https://compliancehub.ng/subscription" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Now</a></p>
        `;
        whatsappMessage = `⏰ Hi ${businessName}!\n\nYour ${planType.toUpperCase()} plan expires in 7 days.\n\nRenew now to keep receiving tax reminders and avoid penalties!\n\nhttps://compliancehub.ng/subscription`;
      } else if (daysUntilExpiry === 3) {
        subject = '🚨 URGENT: Your subscription expires in 3 days';
        emailContent = `
          <h2>Hi ${businessName}!</h2>
          <p><strong>URGENT:</strong> Your ${planType.toUpperCase()} plan expires in just 3 days!</p>
          <p>After expiry, you'll lose access to tax deadline reminders and risk missing important deadlines!</p>
          <p><a href="https://compliancehub.ng/subscription" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Immediately</a></p>
        `;
        whatsappMessage = `🚨 URGENT ${businessName}!\n\nYour ${planType.toUpperCase()} plan expires in 3 days!\n\nDon't risk missing tax deadlines and facing penalties!\n\nRenew now: https://compliancehub.ng/subscription`;
      } else if (daysUntilExpiry === 1) {
        subject = '⚠️ FINAL NOTICE: Subscription expires tomorrow';
        emailContent = `
          <h2>Hi ${businessName}!</h2>
          <p><strong>FINAL NOTICE:</strong> Your ${planType.toUpperCase()} plan expires TOMORROW!</p>
          <p>This is your last chance to renew before losing access to all compliance reminders.</p>
          <p><a href="https://compliancehub.ng/subscription" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">RENEW NOW - Last Chance!</a></p>
        `;
        whatsappMessage = `⚠️ FINAL NOTICE ${businessName}!\n\nYour ${planType.toUpperCase()} plan expires TOMORROW!\n\nLast chance to renew before losing all tax reminders!\n\nhttps://compliancehub.ng/subscription`;
      }

      // Send email
      await supabase.functions.invoke('send-email', {
        body: { to: email, subject, html: emailContent }
      });

      // Send WhatsApp
      if (phone) {
        let whatsappPhone = phone.startsWith('0') ? '+234' + phone.substring(1) : phone;
        whatsappPhone = 'whatsapp:' + whatsappPhone;
        
        await twilioWhatsAppService.sendMessage(whatsappPhone, whatsappMessage);
      }
    } catch (error) {
      console.error('Subscription expiry reminder failed:', error);
    }
  }
};