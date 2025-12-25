import { supabase } from './supabase';
import { twilioWhatsAppService } from './twilioWhatsAppService';

export const followUpService = {
  // Schedule follow-up notifications for new users
  async scheduleFollowUp(userId: string, email: string, businessName: string, phone?: string) {
    try {
      // Send 24-hour follow-up
      setTimeout(async () => {
        await this.send24HourFollowUp(email, businessName, phone);
      }, 24 * 60 * 60 * 1000); // 24 hours

      // Send 72-hour follow-up
      setTimeout(async () => {
        await this.send72HourFollowUp(email, businessName, phone);
      }, 72 * 60 * 60 * 1000); // 72 hours

      console.log('✅ Follow-up notifications scheduled for:', businessName);
    } catch (error) {
      console.error('❌ Failed to schedule follow-ups:', error);
    }
  },

  async send24HourFollowUp(email: string, businessName: string, phone?: string) {
    try {
      // Send email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Getting Started with ComplianceHub',
          html: `
            <h2>Hi ${businessName}!</h2>
            <p>We noticed you joined ComplianceHub yesterday. Here's how to get the most out of your account:</p>
            <ol>
              <li><strong>Add your first tax obligation</strong> - Tell us about your upcoming deadlines</li>
              <li><strong>Set up WhatsApp reminders</strong> - Get notifications on your phone</li>
              <li><strong>Use the tax calculator</strong> - Calculate your tax obligations</li>
            </ol>
            <p>Need help? Just reply to this email!</p>
          `
        }
      });

      // Send WhatsApp if phone available
      if (phone) {
        let whatsappPhone = phone;
        if (whatsappPhone.startsWith('0')) {
          whatsappPhone = '+234' + whatsappPhone.substring(1);
        }
        whatsappPhone = 'whatsapp:' + whatsappPhone;

        await twilioWhatsAppService.sendMessage(
          whatsappPhone,
          `Hi ${businessName}! 👋\n\nReady to add your first tax obligation? It takes just 2 minutes:\n\n1️⃣ Open ComplianceHub\n2️⃣ Click "Add Tax Period"\n3️⃣ Enter your deadline\n\nStay compliant! 📊`
        );
      }

      console.log('✅ 24-hour follow-up sent to:', businessName);
    } catch (error) {
      console.error('❌ 24-hour follow-up failed:', error);
    }
  },

  async send72HourFollowUp(email: string, businessName: string, phone?: string) {
    try {
      // Send email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Don\'t Miss Your Tax Deadlines!',
          html: `
            <h2>Hi ${businessName}!</h2>
            <p>Tax deadlines in Nigeria come fast! Here are the key dates to remember:</p>
            <ul>
              <li><strong>VAT:</strong> 21st of every month</li>
              <li><strong>PAYE:</strong> 10th of every month</li>
              <li><strong>Withholding Tax:</strong> 21st of every month</li>
              <li><strong>CAC Annual Returns:</strong> Once per year</li>
            </ul>
            <p>Let ComplianceHub track these for you automatically!</p>
            <p><a href="https://compliancehub.ng/obligations">Add Your Tax Periods Now</a></p>
          `
        }
      });

      // Send WhatsApp if phone available
      if (phone) {
        let whatsappPhone = phone;
        if (whatsappPhone.startsWith('0')) {
          whatsappPhone = '+234' + whatsappPhone.substring(1);
        }
        whatsappPhone = 'whatsapp:' + whatsappPhone;

        await twilioWhatsAppService.sendMessage(
          whatsappPhone,
          `⚠️ ${businessName}, don't forget!\n\nNigerian tax deadlines:\n📅 VAT: 21st monthly\n📅 PAYE: 10th monthly\n📅 WHT: 21st monthly\n📅 CAC: Annual\n\nLet us remind you automatically! 🔔`
        );
      }

      console.log('✅ 72-hour follow-up sent to:', businessName);
    } catch (error) {
      console.error('❌ 72-hour follow-up failed:', error);
    }
  }
};