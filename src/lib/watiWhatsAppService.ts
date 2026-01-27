// Wati.io WhatsApp Service - SAME DAY SETUP
class WatiWhatsAppService {
  private apiKey = import.meta.env.VITE_WATI_API_KEY;
  private baseUrl = import.meta.env.VITE_WATI_BASE_URL; // e.g., https://live-server-12345.wati.io/api/v1

  async sendMessage(phone: string, message: string) {
    try {
      const cleanPhone = phone.replace(/[^\d]/g, '');
      
      const response = await fetch(`${this.baseUrl}/sendSessionMessage/${cleanPhone}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageText: message
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Wati API error: ${result.message}`);
      }

      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTaxReminder(phone: string, taxType: string, dueDate: string, daysLeft: number) {
    const urgencyEmoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    
    const message = `${urgencyEmoji} *TAX REMINDER*

*${taxType.toUpperCase()}* Due: ${dueDate}
Days Left: *${daysLeft}*

${daysLeft <= 1 ? '🔥 *URGENT: File today to avoid penalties!*' : 
  daysLeft <= 3 ? '⚠️ Don\'t forget to file soon!' : 
  '📋 Friendly reminder - deadline approaching'}

💰 Calculate tax: compliancehub.ng/calculator
📄 File online: nrs.gov.ng

_ComplianceHub - Never miss a deadline_`;

    return this.sendMessage(phone, message);
  }

  async sendWelcomeMessage(phone: string, businessName: string) {
    const message = `🎉 *Welcome to ComplianceHub!*

Hi ${businessName}! 👋

Your tax reminders are now *ACTIVE*:
✅ VAT (21st monthly)
✅ PAYE (10th monthly) 
✅ CAC Annual Returns

📱 We'll remind you *7, 3, and 1 day* before each deadline.

🔗 Dashboard: compliancehub.ng
💬 Questions? Reply to this message

_Never miss a deadline again!_ 🚀`;

    return this.sendMessage(phone, message);
  }
}

export const watiWhatsAppService = new WatiWhatsAppService();