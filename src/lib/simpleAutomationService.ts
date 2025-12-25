import { freshDbService } from './freshDbService';
import { twilioWhatsAppService } from './twilioWhatsAppService';

class SimpleAutomationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start checking for upcoming deadlines every hour
  start() {
    if (this.isRunning) return;
    
    console.log('🤖 Starting simple automation service...');
    this.isRunning = true;
    
    // Check immediately
    this.checkDeadlines();
    
    // Then check every hour
    this.intervalId = setInterval(() => {
      this.checkDeadlines();
    }, 60 * 60 * 1000); // 1 hour
    
    console.log('✅ Simple automation service started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Simple automation service stopped');
  }

  private async checkDeadlines() {
    try {
      console.log('🔍 Checking tax deadlines...');
      
      // Get all users (we'll need to implement this)
      // For now, let's create a manual trigger method
      
    } catch (error) {
      console.error('❌ Deadline check failed:', error);
    }
  }

  // Manual method to check deadlines for a specific user
  async checkUserDeadlines(userId: string) {
    try {
      console.log(`🔍 Checking deadlines for user: ${userId}`);
      
      // Get user's obligations
      const obligations = await freshDbService.getObligations(userId);
      const profile = await freshDbService.getProfile(userId);
      
      if (!profile) {
        console.log('❌ No profile found for user');
        return;
      }

      const today = new Date();
      const userName = profile.business_name || 'there';
      
      for (const obligation of obligations) {
        if (!obligation.is_active) continue;
        
        const dueDate = new Date(obligation.next_due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminders at 7, 3, and 1 days before
        if ([7, 3, 1].includes(daysUntilDue)) {
          console.log(`📅 Sending ${daysUntilDue}-day reminder for ${obligation.obligation_type}`);
          
          // Send email
          try {
            const emailPayload = {
              to: profile.email,
              subject: `Tax Reminder: ${obligation.obligation_type} Due in ${daysUntilDue} Days`,
              html: `
                <h2>Tax Deadline Reminder</h2>
                <p>Hi ${userName},</p>
                <p><strong>${obligation.obligation_type}</strong> is due in <strong>${daysUntilDue} days</strong>.</p>
                <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
                <p><strong>Tax Period:</strong> ${obligation.tax_period}</p>
                <p>Don't forget to file on time to avoid penalties!</p>
                <p>Best regards,<br>ComplianceHub Team</p>
              `
            };
            
            const emailResponse = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/send-email', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'
              },
              body: JSON.stringify(emailPayload)
            });
            
            if (emailResponse.ok) {
              console.log('✅ Email reminder sent');
            }
          } catch (emailError) {
            console.error('❌ Email reminder failed:', emailError);
          }
          
          // Send WhatsApp if phone exists
          if (profile.phone) {
            try {
              const whatsappMessage = `🚨 TAX REMINDER\n\n${obligation.obligation_type} due in ${daysUntilDue} days!\n\nDue: ${dueDate.toLocaleDateString()}\nPeriod: ${obligation.tax_period}\n\nDon't forget to file on time!\n\n- ComplianceHub`;
              
              await twilioWhatsAppService.sendMessage(profile.phone, whatsappMessage);
              console.log('✅ WhatsApp reminder sent');
            } catch (whatsappError) {
              console.error('❌ WhatsApp reminder failed:', whatsappError);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ User deadline check failed:', error);
    }
  }
}

export const simpleAutomationService = new SimpleAutomationService();