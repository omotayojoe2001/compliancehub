interface WhatsAppMessage {
  to: string; // Format: whatsapp:+2348012345678
  message: string;
}

class TwilioWhatsAppService {
  private accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  private authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  private fromNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;

  // Simple method for direct message sending
  async sendMessage(to: string, message: string) {
    const formattedTo = this.formatPhoneNumber(to);
    return this.sendMessageInternal(formattedTo, message);
  }

  // Internal method that does the actual sending
  private async sendMessageInternal(to: string, message: string) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: this.fromNumber,
            To: to,
            Body: message
          })
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Twilio error: ${result.message}`);
      }

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }
  }

  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Handle Nigerian numbers starting with 0
    if (cleaned.startsWith('0')) {
      cleaned = '+234' + cleaned.substring(1);
    }
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    // Add whatsapp: prefix
    return `whatsapp:${cleaned}`;
  }

  async sendTaxReminder(phone: string, taxType: string, dueDate: string, daysLeft: number) {
    const urgencyEmoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    
    const message = `${urgencyEmoji} *TAX REMINDER*

*${taxType.toUpperCase()}* Due: ${dueDate}
Days Left: *${daysLeft}*

${daysLeft <= 1 ? '🔥 *URGENT: File today to avoid penalties!*' : 
  daysLeft <= 3 ? '⚠️ Don\'t forget to file soon!' : 
  '📋 Friendly reminder - deadline approaching'}

💰 Calculate tax: your-calculator-link
📄 File online: firs.gov.ng

Reply *HELP* for assistance

_ComplianceHub - Never miss a deadline_`;

    const formattedPhone = this.formatPhoneNumber(phone);
    return this.sendMessageInternal(formattedPhone, message);
  }

  async sendWelcomeMessage(phone: string, businessName: string) {
    const message = `🎉 *Welcome to ComplianceHub!*

Hi ${businessName}! 👋

Your tax reminders are now *ACTIVE*:
✅ VAT (21st monthly)
✅ PAYE (10th monthly) 
✅ CAC Annual Returns

📱 We'll remind you *7, 3, and 1 day* before each deadline.

🔗 Dashboard: your-app-url.com
💬 Questions? Reply *HELP*

_Never miss a deadline again!_ 🚀`;

    const formattedPhone = this.formatPhoneNumber(phone);
    return this.sendMessageInternal(formattedPhone, message);
  }

  async sendPaymentReminder(phone: string, businessName: string, plan: string, expiryDate: string) {
    const message = `💳 *Subscription Reminder*

Hi ${businessName},

Your *${plan.toUpperCase()}* plan expires on ${expiryDate}.

⚠️ Renew now to keep receiving tax reminders:
• VAT deadlines
• PAYE reminders  
• CAC notifications

💰 Renew: your-payment-link
📱 Dashboard: your-app-url.com

_ComplianceHub Team_`;

    const formattedPhone = this.formatPhoneNumber(phone);
    return this.sendMessageInternal(formattedPhone, message);
  }
}

export const twilioWhatsAppService = new TwilioWhatsAppService();