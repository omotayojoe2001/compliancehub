import { supabase } from './supabase';
import { whatsappService } from './whatsappService';
import { emailService } from './emailService';

class ScheduledMessageService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (this.intervalId) return;
    
    console.log('📅 Starting scheduled message service...');
    this.processMessages();
    this.intervalId = setInterval(() => this.processMessages(), 60000); // Check every minute
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('📅 Stopped scheduled message service');
    }
  }

  private async processMessages() {
    try {
      const now = new Date().toISOString();
      
      const { data: messages, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_time', now)
        .limit(10);

      if (error) throw error;
      if (!messages || messages.length === 0) return;

      console.log(`📅 Processing ${messages.length} scheduled messages`);

      for (const message of messages) {
        try {
          let emailSent = false;
          let whatsappSent = false;

          // Send email if requested
          if (message.send_via_email && message.target_email) {
            console.log(`📧 Sending email to ${message.target_email}`);
            const result = await emailService.sendEmail({
              to: message.target_email,
              subject: message.email_subject || 'Notification',
              body: message.message_body
            });
            emailSent = result.success;
            if (!emailSent) {
              console.error('Email send failed:', result.error);
            }
          }

          // Send WhatsApp if requested
          if (message.send_via_whatsapp && message.target_phone) {
            console.log(`📱 Sending WhatsApp to ${message.target_phone}`);
            await whatsappService.sendMessage(message.target_phone, message.message_body);
            whatsappSent = true;
          }

          // Update status
          const allSent = (!message.send_via_email || emailSent) && (!message.send_via_whatsapp || whatsappSent);
          
          await supabase
            .from('scheduled_messages')
            .update({ 
              status: allSent ? 'sent' : 'failed', 
              sent_at: new Date().toISOString() 
            })
            .eq('id', message.id);

          console.log(`✅ Message ${message.id} processed - Email: ${emailSent}, WhatsApp: ${whatsappSent}`);
        } catch (msgError) {
          console.error(`❌ Failed to send message ${message.id}:`, msgError);
          
          await supabase
            .from('scheduled_messages')
            .update({ status: 'failed' })
            .eq('id', message.id);
        }
      }
    } catch (error) {
      console.error('❌ Error processing scheduled messages:', error);
    }
  }
}

export const scheduledMessageService = new ScheduledMessageService();
