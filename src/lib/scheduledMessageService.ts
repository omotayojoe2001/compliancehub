import { supabase } from './supabase';
import { whatsappService } from './whatsappService';

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
          if (message.send_via_whatsapp && message.target_phone) {
            console.log(`📱 Sending WhatsApp to ${message.target_phone}`);
            await whatsappService.sendMessage(message.target_phone, message.message_body);
          }

          await supabase
            .from('scheduled_messages')
            .update({ 
              status: 'sent', 
              sent_at: new Date().toISOString() 
            })
            .eq('id', message.id);

          console.log(`✅ Message ${message.id} sent successfully`);
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
