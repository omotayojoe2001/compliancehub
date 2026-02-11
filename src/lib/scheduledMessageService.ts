import { supabase } from './supabase';
import { emailService } from './emailService';
import { whatsappService } from './whatsappService';

export const scheduledMessageService = {
  // Process pending scheduled messages
  async processPendingMessages() {
    const now = new Date().toISOString();
    
    // Get all pending messages that are due
    const { data: messages, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', now);

    if (error || !messages) {
      console.error('Failed to fetch scheduled messages:', error);
      return;
    }

    console.log(`Processing ${messages.length} scheduled messages...`);

    for (const msg of messages) {
      try {
        if (msg.target_type === 'all') {
          // Send to all users
          const { data: users } = await supabase
            .from('profiles')
            .select('email, phone, business_name');

          if (users) {
            for (const user of users) {
              const message = msg.message_body.replace('{{business_name}}', user.business_name || 'there');
              
              if (msg.send_via_email && user.email) {
                await emailService.sendEmail({
                  to: user.email,
                  subject: msg.email_subject || 'Message from TaxandCompliance',
                  body: message
                });
              }
              
              if (msg.send_via_whatsapp && user.phone) {
                await whatsappService.sendMessage(user.phone, message);
              }
            }
          }
        } else {
          // Send to individual
          if (msg.send_via_email && msg.target_email) {
            await emailService.sendEmail({
              to: msg.target_email,
              subject: msg.email_subject || 'Message from TaxandCompliance',
              body: msg.message_body
            });
          }
          
          if (msg.send_via_whatsapp && msg.target_phone) {
            await whatsappService.sendMessage(msg.target_phone, msg.message_body);
          }
        }

        // Mark as sent
        await supabase
          .from('scheduled_messages')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', msg.id);

        console.log(`✅ Scheduled message ${msg.id} sent successfully`);
      } catch (error) {
        console.error(`❌ Failed to send scheduled message ${msg.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('scheduled_messages')
          .update({ status: 'failed' })
          .eq('id', msg.id);
      }
    }
  },

  // Start the scheduler (runs every minute)
  startScheduler() {
    console.log('🚀 Starting scheduled message processor...');
    
    // Run immediately
    this.processPendingMessages();
    
    // Then run every minute
    setInterval(() => {
      this.processPendingMessages();
    }, 60000); // 1 minute
    
    console.log('✅ Scheduler started - checking every minute');
  }
};
