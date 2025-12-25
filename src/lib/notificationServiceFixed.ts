import { twilioWhatsAppService } from './twilioWhatsAppService';

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/send-email', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'
    },
    body: JSON.stringify({ to, subject, html })
  });
  return response.json();
};

export const notificationService = {
  // 1. Welcome notifications (immediate)
  async sendWelcomeNotifications(email: string, businessName: string, phone?: string) {
    try {
      // Welcome Email
      await sendEmail(email, '🎉 Welcome to ComplianceHub!', `
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
              <a href="https://compliance.forecourtlimited.com/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Your Setup</a>
            </div>
          </div>
        </div>
      `);

      // Welcome WhatsApp
      if (phone) {
        await twilioWhatsAppService.sendMessage(
          phone,
          `🎉 Welcome to ComplianceHub, ${businessName}!\n\nYour account is ready. Complete your setup to start receiving tax reminders.\n\n✅ Never miss deadlines\n✅ Avoid penalties\n✅ Stay compliant\n\nGet started: https://compliance.forecourtlimited.com/dashboard`
        );
      }
    } catch (error) {
      console.error('Welcome notifications failed:', error);
    }
  },

  // 2. Follow-up notifications (30 minutes after signup)
  async sendFollowUpNotifications(email: string, businessName: string, phone?: string) {
    try {
      await sendEmail(email, '⏰ Complete your ComplianceHub setup (2 minutes)', `
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
              <a href="https://compliance.forecourtlimited.com/dashboard" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Setup Now (2 mins)</a>
            </div>
          </div>
        </div>
      `);

      if (phone) {
        await twilioWhatsAppService.sendMessage(
          phone,
          `⏰ Hi ${businessName}!\n\nQuick reminder: Complete your ComplianceHub setup to start receiving tax deadline alerts.\n\n⚠️ Without setup, you might miss important deadlines!\n\nTakes 2 minutes: https://compliance.forecourtlimited.com/dashboard`
        );
      }
    } catch (error) {
      console.error('Follow-up notifications failed:', error);
    }
  },

  // 3. Educational notifications (2 hours after signup)
  async sendEducationalNotifications(email: string, businessName: string, phone?: string) {
    try {
      await sendEmail(email, '📚 Nigerian Tax Compliance Made Simple', `
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
              <a href="https://compliance.forecourtlimited.com/dashboard" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Tracking Your Deadlines</a>
            </div>
          </div>
        </div>
      `);

      if (phone) {
        await twilioWhatsAppService.sendMessage(
          phone,
          `📚 ${businessName}, here are key Nigerian tax deadlines:\n\n📅 VAT: 21st monthly\n📅 PAYE: 10th monthly\n📅 WHT: 21st monthly\n📅 CAC: 42 days after anniversary\n\nLet ComplianceHub track these for you automatically! 🎯\n\nhttps://compliance.forecourtlimited.com/dashboard`
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
      
      await sendEmail(email, `${urgencyText}: ${taxType} Filing Due in ${daysUntilDue} Day${daysUntilDue === 1 ? '' : 's'}`, `
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
              <a href="https://compliance.forecourtlimited.com/dashboard" style="background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
            </div>
          </div>
        </div>
      `);

      if (phone) {
        await twilioWhatsAppService.sendMessage(
          phone,
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
        emailContent = `<h2>Hi ${businessName}!</h2><p>Your <strong>${planType.toUpperCase()}</strong> plan expires in 7 days.</p><p>Don't miss your tax deadlines! Renew now to continue receiving:</p><ul><li>✅ Automated tax deadline reminders</li><li>✅ Compliance guides and calculators</li><li>✅ Peace of mind for your business</li></ul><p><a href="https://compliance.forecourtlimited.com/subscription" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Now</a></p>`;
        whatsappMessage = `⏰ Hi ${businessName}!\n\nYour ${planType.toUpperCase()} plan expires in 7 days.\n\nRenew now to keep receiving tax reminders and avoid penalties!\n\nhttps://compliance.forecourtlimited.com/subscription`;
      } else if (daysUntilExpiry === 3) {
        subject = '🚨 URGENT: Your subscription expires in 3 days';
        emailContent = `<h2>Hi ${businessName}!</h2><p><strong>URGENT:</strong> Your ${planType.toUpperCase()} plan expires in just 3 days!</p><p>After expiry, you'll lose access to tax deadline reminders and risk missing important deadlines!</p><p><a href="https://compliance.forecourtlimited.com/subscription" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Immediately</a></p>`;
        whatsappMessage = `🚨 URGENT ${businessName}!\n\nYour ${planType.toUpperCase()} plan expires in 3 days!\n\nDon't risk missing tax deadlines and facing penalties!\n\nRenew now: https://compliance.forecourtlimited.com/subscription`;
      } else if (daysUntilExpiry === 1) {
        subject = '⚠️ FINAL NOTICE: Subscription expires tomorrow';
        emailContent = `<h2>Hi ${businessName}!</h2><p><strong>FINAL NOTICE:</strong> Your ${planType.toUpperCase()} plan expires TOMORROW!</p><p>This is your last chance to renew before losing access to all compliance reminders.</p><p><a href="https://compliance.forecourtlimited.com/subscription" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">RENEW NOW - Last Chance!</a></p>`;
        whatsappMessage = `⚠️ FINAL NOTICE ${businessName}!\n\nYour ${planType.toUpperCase()} plan expires TOMORROW!\n\nLast chance to renew before losing all tax reminders!\n\nhttps://compliance.forecourtlimited.com/subscription`;
      }

      await sendEmail(email, subject, emailContent);

      if (phone) {
        await twilioWhatsAppService.sendMessage(phone, whatsappMessage);
      }
    } catch (error) {
      console.error('Subscription expiry reminder failed:', error);
    }
  }
};

export const notificationServiceFixed = notificationService;