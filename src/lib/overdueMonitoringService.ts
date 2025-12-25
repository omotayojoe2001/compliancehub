import { freshDbService } from './freshDbService';
import { notificationServiceFixed } from './notificationServiceFixed';

export const overdueMonitoringService = {
  // Check and process all overdue obligations daily
  async processOverdueObligations() {
    console.log('🔍 Starting overdue obligations processing...');
    
    try {
      // Get all overdue obligations that need daily reminders
      const overdueObligations = await this.getOverdueObligations();
      
      for (const obligation of overdueObligations) {
        await this.sendOverdueReminder(obligation);
      }
      
      console.log(`✅ Processed ${overdueObligations.length} overdue obligations`);
    } catch (error) {
      console.error('❌ Error processing overdue obligations:', error);
    }
  },

  // Get all overdue obligations that need reminders
  async getOverdueObligations() {
    const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/tax_obligations?payment_status=eq.overdue&is_active=eq.true&select=*,profiles(business_name,email,phone_number)`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Filter obligations that need daily reminders (haven't been reminded today)
    const today = new Date().toDateString();
    return data.filter(obligation => {
      const lastReminder = obligation.last_overdue_reminder;
      return !lastReminder || new Date(lastReminder).toDateString() !== today;
    });
  },

  // Send overdue reminder via email and WhatsApp
  async sendOverdueReminder(obligation) {
    const profile = obligation.profiles;
    const daysOverdue = Math.floor((new Date() - new Date(obligation.next_due_date)) / (1000 * 60 * 60 * 24));
    
    const message = `🚨 OVERDUE ALERT: Your ${obligation.obligation_type} payment is ${daysOverdue} days overdue. Due date was ${new Date(obligation.next_due_date).toLocaleDateString()}. Please pay immediately to avoid penalties. If already paid, mark as paid in your ComplianceHub dashboard.`;
    
    try {
      // Send email notification
      await notificationServiceFixed.sendEmail({
        to: profile.email,
        subject: `🚨 OVERDUE: ${obligation.obligation_type} Payment Required`,
        message: message,
        business_name: profile.business_name
      });
      
      // Send WhatsApp notification
      if (profile.phone_number) {
        await notificationServiceFixed.sendWhatsApp({
          to: profile.phone_number,
          message: message
        });
      }
      
      // Update reminder tracking
      await this.updateReminderTracking(obligation.id);
      
      // Log the reminder
      await freshDbService.addReminderLog(obligation.user_id, {
        obligation_id: obligation.id,
        reminder_type: 'overdue_daily',
        message_content: message,
        status: 'sent',
        scheduled_date: new Date().toISOString(),
        sent_date: new Date().toISOString()
      });
      
      console.log(`✅ Sent overdue reminder for ${obligation.obligation_type} to ${profile.business_name}`);
    } catch (error) {
      console.error(`❌ Failed to send overdue reminder for ${obligation.id}:`, error);
    }
  },

  // Update reminder tracking in database
  async updateReminderTracking(obligationId) {
    const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/tax_obligations?id=eq.${obligationId}`, {
      method: 'PATCH',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        last_overdue_reminder: new Date().toISOString(),
        overdue_reminder_count: 'overdue_reminder_count + 1'
      })
    });
    
    return response.ok;
  },

  // Mark obligation as paid (called by user)
  async markAsPaid(obligationId, userId) {
    try {
      const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/tax_obligations?id=eq.${obligationId}&user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_status: 'paid',
          marked_paid_date: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        // Log the payment marking
        await freshDbService.addReminderLog(userId, {
          obligation_id: obligationId,
          reminder_type: 'payment_marked',
          message_content: 'Obligation marked as paid by user',
          status: 'completed',
          scheduled_date: new Date().toISOString(),
          sent_date: new Date().toISOString()
        });
        
        console.log(`✅ Obligation ${obligationId} marked as paid`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error marking obligation as paid:', error);
      return false;
    }
  },

  // Update overdue status for all obligations (run daily)
  async updateOverdueStatus() {
    try {
      // Mark pending obligations as overdue if past due date
      const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/tax_obligations?payment_status=eq.pending&next_due_date=lt.${new Date().toISOString().split('T')[0]}&is_active=eq.true`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_status: 'overdue'
        })
      });
      
      console.log('✅ Updated overdue status for past due obligations');
      return response.ok;
    } catch (error) {
      console.error('❌ Error updating overdue status:', error);
      return false;
    }
  },

  // Main daily job - run this every day
  async runDailyOverdueJob() {
    console.log('🚀 Starting daily overdue monitoring job...');
    
    // Update overdue status first
    await this.updateOverdueStatus();
    
    // Process overdue reminders
    await this.processOverdueObligations();
    
    console.log('✅ Daily overdue monitoring job completed');
  }
};