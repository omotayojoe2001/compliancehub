import { supabase } from './supabase';

// WhatsApp service using direct Wawp API
const WAWP_INSTANCE = 'C5A0B44DFCA6';
const WAWP_ACCESS_TOKEN = 'mBV1vrB8zxaMNX';

interface WhatsAppMessage {
  phone: string; // Format: 2348012345678 (country code + number, no +)
  message: string;
}

export const whatsappService = {
  // Send WhatsApp message directly to Wawp API
  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const formattedPhone = phone.replace(/[^0-9]/g, '');
      const chatId = `${formattedPhone}@c.us`;
      
      console.log('📱 Sending WhatsApp to:', chatId);
      console.log('📱 Message:', message.substring(0, 50) + '...');
      
      const url = `https://wawp.net/wp-json/awp/v1/send?instance_id=${WAWP_INSTANCE}&access_token=${WAWP_ACCESS_TOKEN}&chatId=${chatId}&message=${encodeURIComponent(message)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      console.log('WhatsApp API Response:', result);
      
      if (result.id) {
        console.log('✅ WhatsApp sent successfully to', chatId);
        return true;
      } else {
        console.error('❌ WhatsApp API returned no ID:', result);
        return false;
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  },

  // Send tax reminder via WhatsApp
  async sendTaxReminder(
    phone: string,
    taxType: string,
    dueDate: string,
    amount: number
  ): Promise<boolean> {
    const message = `🔔 *Tax Reminder*\n\n` +
      `Tax Type: ${taxType}\n` +
      `Due Date: ${new Date(dueDate).toLocaleDateString()}\n` +
      `Amount: ₦${amount.toLocaleString()}\n\n` +
      `Don't forget to file your tax return on time!\n\n` +
      `- TaxandCompliance T&C`;

    return this.sendMessage(phone, message);
  },

  // Send invoice via WhatsApp
  async sendInvoice(
    phone: string,
    invoiceNumber: string,
    clientName: string,
    amount: number,
    dueDate: string
  ): Promise<boolean> {
    const message = `📄 *Invoice ${invoiceNumber}*\n\n` +
      `Dear ${clientName},\n\n` +
      `Amount: ₦${amount.toLocaleString()}\n` +
      `Due Date: ${new Date(dueDate).toLocaleDateString()}\n\n` +
      `Please process payment at your earliest convenience.\n\n` +
      `Thank you for your business!\n` +
      `- TaxandCompliance T&C`;

    return this.sendMessage(phone, message);
  },

  // Format phone number for WhatsApp (remove + and spaces)
  formatPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }
};
