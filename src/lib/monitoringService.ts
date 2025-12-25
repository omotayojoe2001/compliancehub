import { supabase } from './supabase';
import { emailService } from './emailService';

interface MonitoringResult {
  timestamp: string;
  totalUsers: number;
  activeSubscriptions: number;
  upcomingDeadlines: number;
  remindersSent: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  issues: string[];
}

export const monitoringService = {
  // Main monitoring function that runs every hour
  async performHealthCheck(): Promise<MonitoringResult> {
    console.log('🔍 Starting system health check...');
    
    const result: MonitoringResult = {
      timestamp: new Date().toISOString(),
      totalUsers: 0,
      activeSubscriptions: 0,
      upcomingDeadlines: 0,
      remindersSent: 0,
      systemHealth: 'healthy',
      issues: []
    };

    try {
      // Check total users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, plan, subscription_status');
      
      if (usersError) {
        result.issues.push(`Failed to fetch users: ${usersError.message}`);
        result.systemHealth = 'critical';
      } else {
        result.totalUsers = users?.length || 0;
        result.activeSubscriptions = users?.filter(u => u.subscription_status === 'active').length || 0;
      }

      // Check upcoming deadlines (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data: obligations, error: obligationsError } = await supabase
        .from('tax_obligations')
        .select('*')
        .eq('is_active', true)
        .lte('next_due_date', thirtyDaysFromNow.toISOString().split('T')[0]);
      
      if (obligationsError) {
        result.issues.push(`Failed to fetch obligations: ${obligationsError.message}`);
        result.systemHealth = 'critical';
      } else {
        result.upcomingDeadlines = obligations?.length || 0;
      }

      // Check reminders sent today
      const today = new Date().toISOString().split('T')[0];
      const { data: reminders, error: remindersError } = await supabase
        .from('reminder_logs')
        .select('*')
        .gte('sent_at', `${today}T00:00:00`)
        .lte('sent_at', `${today}T23:59:59`);
      
      if (remindersError) {
        result.issues.push(`Failed to fetch reminder logs: ${remindersError.message}`);
        result.systemHealth = 'warning';
      } else {
        result.remindersSent = reminders?.length || 0;
      }

      // Validate system health
      if (result.activeSubscriptions > 0 && result.upcomingDeadlines > 0 && result.remindersSent === 0) {
        result.issues.push('No reminders sent today despite upcoming deadlines');
        result.systemHealth = 'warning';
      }

      if (result.issues.length > 2) {
        result.systemHealth = 'critical';
      } else if (result.issues.length > 0) {
        result.systemHealth = 'warning';
      }

      // Log monitoring result
      await this.logMonitoringResult(result);
      
      console.log('🔍 Health check completed:', result);
      return result;

    } catch (error) {
      result.issues.push(`System error: ${error}`);
      result.systemHealth = 'critical';
      console.error('🔍 Health check failed:', error);
      return result;
    }
  },

  // Check specific user's obligations and send reminders
  async checkUserObligations(userId: string): Promise<void> {
    console.log('👤 Checking obligations for user:', userId);
    
    const { data: obligations, error } = await supabase
      .from('tax_obligations')
      .select(`
        *,
        profiles!inner(email, business_name, plan, subscription_status)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) {
      console.error('👤 Failed to fetch user obligations:', error);
      return;
    }

    for (const obligation of obligations || []) {
      await this.checkObligationDeadline(obligation);
    }
  },

  // Check if an obligation needs a reminder
  async checkObligationDeadline(obligation: any): Promise<void> {
    const dueDate = new Date(obligation.next_due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Send reminders at 7, 3, and 1 days before due date
    const reminderDays = [7, 3, 1];
    
    if (reminderDays.includes(daysUntilDue)) {
      // Check if reminder already sent today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingReminder } = await supabase
        .from('reminder_logs')
        .select('*')
        .eq('user_id', obligation.user_id)
        .eq('obligation_type', obligation.obligation_type)
        .gte('sent_at', `${today}T00:00:00`)
        .lte('sent_at', `${today}T23:59:59`)
        .single();
      
      if (!existingReminder) {
        await this.sendReminderForObligation(obligation, daysUntilDue);
      }
    }
  },

  // Send reminder for specific obligation
  async sendReminderForObligation(obligation: any, daysUntilDue: number): Promise<void> {
    try {
      // Check if user has active subscription
      if (obligation.profiles.subscription_status !== 'active') {
        console.log('⏭️ Skipping reminder - user subscription inactive');
        return;
      }

      await emailService.sendReminderEmail({
        to: obligation.profiles.email,
        businessName: obligation.profiles.business_name,
        obligationType: obligation.obligation_type,
        daysUntilDue,
        dueDate: obligation.next_due_date
      });

      // Log the reminder
      await supabase
        .from('reminder_logs')
        .insert({
          user_id: obligation.user_id,
          obligation_type: obligation.obligation_type,
          reminder_type: 'email',
          sent_at: new Date().toISOString(),
          status: 'sent',
          message_content: `${obligation.obligation_type} due in ${daysUntilDue} days`
        });

      console.log(`📧 Reminder sent: ${obligation.obligation_type} for ${obligation.profiles.business_name}`);
    } catch (error) {
      console.error('📧 Failed to send reminder:', error);
      
      // Log the failure
      await supabase
        .from('reminder_logs')
        .insert({
          user_id: obligation.user_id,
          obligation_type: obligation.obligation_type,
          reminder_type: 'email',
          sent_at: new Date().toISOString(),
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
  },

  // Log monitoring results for tracking
  async logMonitoringResult(result: MonitoringResult): Promise<void> {
    try {
      // Create monitoring_logs table entry (you'll need to create this table)
      console.log('📊 Monitoring result logged:', {
        timestamp: result.timestamp,
        health: result.systemHealth,
        users: result.totalUsers,
        active_subs: result.activeSubscriptions,
        upcoming: result.upcomingDeadlines,
        reminders: result.remindersSent,
        issues: result.issues.length
      });
    } catch (error) {
      console.error('📊 Failed to log monitoring result:', error);
    }
  },

  // Get system status for dashboard
  async getSystemStatus(): Promise<MonitoringResult | null> {
    return await this.performHealthCheck();
  },

  // Manual trigger for testing
  async runManualCheck(): Promise<MonitoringResult> {
    console.log('🔧 Running manual system check...');
    return await this.performHealthCheck();
  }
};