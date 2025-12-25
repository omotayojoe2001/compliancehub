import { notificationServiceFixed } from './notificationServiceFixed';
import { freshDbService } from './freshDbService';
import { simpleAutomationService } from './simpleAutomationService';

class ComprehensiveAutomationService {
  private taxReminderInterval: NodeJS.Timeout | null = null;
  private subscriptionInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start all automation services
  start() {
    if (this.isRunning) {
      console.log('🤖 Automation already running');
      return;
    }

    console.log('🤖 Starting comprehensive automation system...');
    this.isRunning = true;

    // Start tax deadline reminders (every hour)
    this.taxReminderInterval = setInterval(() => {
      this.checkAllUserTaxDeadlines();
    }, 60 * 60 * 1000); // 1 hour

    // Start subscription reminders (every 6 hours)
    this.subscriptionInterval = setInterval(() => {
      this.checkAllSubscriptionExpiries();
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Run initial checks
    this.checkAllUserTaxDeadlines();
    this.checkAllSubscriptionExpiries();

    console.log('✅ Comprehensive automation system started');
    console.log('📅 Tax reminders: Every hour');
    console.log('💳 Subscription reminders: Every 6 hours');
  }

  // Stop all automation services
  stop() {
    if (this.taxReminderInterval) {
      clearInterval(this.taxReminderInterval);
      this.taxReminderInterval = null;
    }
    if (this.subscriptionInterval) {
      clearInterval(this.subscriptionInterval);
      this.subscriptionInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Comprehensive automation system stopped');
  }

  // Process upcoming reminders (7, 3, 1 days before due date)
  async processUpcomingReminders() {
    try {
      console.log('🔍 Processing upcoming tax deadline reminders...');
      
      // Get all active obligations that need reminders
      const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/tax_obligations?payment_status=neq.paid&is_active=eq.true&select=*,profiles(business_name,email,phone_number)`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json'
        }
      });
      
      const obligations = await response.json();
      const today = new Date();
      
      for (const obligation of obligations) {
        const dueDate = new Date(obligation.next_due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminders at 7, 3, and 1 days before
        if ([7, 3, 1].includes(daysUntilDue)) {
          await this.sendUpcomingReminder(obligation, daysUntilDue);
        }
      }
      
      console.log('✅ Upcoming reminders processed');
    } catch (error) {
      console.error('❌ Error processing upcoming reminders:', error);
    }
  }

  async sendUpcomingReminder(obligation: any, daysUntilDue: number) {
    const profile = obligation.profiles;
    const message = `📅 Reminder: Your ${obligation.obligation_type} payment is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}. Due date: ${new Date(obligation.next_due_date).toLocaleDateString()}. Don't forget to file and pay on time!`;
    
    try {
      // Send email
      await notificationServiceFixed.sendEmail({
        to: profile.email,
        subject: `📅 ${daysUntilDue}-Day Reminder: ${obligation.obligation_type} Due Soon`,
        message: message,
        business_name: profile.business_name
      });
      
      // Send WhatsApp
      if (profile.phone_number) {
        await notificationServiceFixed.sendWhatsApp({
          to: profile.phone_number,
          message: message
        });
      }
      
      // Log the reminder
      await freshDbService.addReminderLog(obligation.user_id, {
        obligation_id: obligation.id,
        reminder_type: `${daysUntilDue}_day_reminder`,
        message_content: message,
        status: 'sent',
        scheduled_date: new Date().toISOString(),
        sent_date: new Date().toISOString()
      });
      
      console.log(`✅ Sent ${daysUntilDue}-day reminder for ${obligation.obligation_type} to ${profile.business_name}`);
    } catch (error) {
      console.error(`❌ Failed to send upcoming reminder for ${obligation.id}:`, error);
    }
  }

  // Process subscription reminders
  async processSubscriptionReminders() {
    try {
      console.log('💳 Processing subscription reminders...');
      
      // Get subscriptions expiring soon
      const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/subscriptions?status=eq.active&select=*,profiles(business_name,email,phone_number)`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json'
        }
      });
      
      const subscriptions = await response.json();
      const today = new Date();
      
      for (const subscription of subscriptions) {
        if (!subscription.next_payment_date) continue;
        
        const renewalDate = new Date(subscription.next_payment_date);
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminders at 7, 3, and 1 days before renewal
        if ([7, 3, 1].includes(daysUntilRenewal)) {
          await this.sendSubscriptionReminder(subscription, daysUntilRenewal);
        }
      }
      
      console.log('✅ Subscription reminders processed');
    } catch (error) {
      console.error('❌ Error processing subscription reminders:', error);
    }
  }

  async sendSubscriptionReminder(subscription: any, daysUntilRenewal: number) {
    const profile = subscription.profiles;
    const message = `💳 Your ${subscription.plan_type} subscription renews in ${daysUntilRenewal} day${daysUntilRenewal > 1 ? 's' : ''}. Amount: ₦${(subscription.amount / 100).toLocaleString()}. Renewal date: ${new Date(subscription.next_payment_date).toLocaleDateString()}.`;
    
    try {
      await notificationServiceFixed.sendEmail({
        to: profile.email,
        subject: `💳 Subscription Renewal in ${daysUntilRenewal} Day${daysUntilRenewal > 1 ? 's' : ''}`,
        message: message,
        business_name: profile.business_name
      });
      
      if (profile.phone_number) {
        await notificationServiceFixed.sendWhatsApp({
          to: profile.phone_number,
          message: message
        });
      }
      
      console.log(`✅ Sent subscription reminder to ${profile.business_name}`);
    } catch (error) {
      console.error(`❌ Failed to send subscription reminder:`, error);
    }
  }

  // Check tax deadlines for all users
  private async checkAllUserTaxDeadlines() {
    try {
      console.log('🔍 Checking tax deadlines for all users...');
      
      // Get all users with profiles (we'll need to implement this properly)
      const userIds = await this.getAllUserIds();
      
      for (const userId of userIds) {
        await this.checkUserTaxDeadlines(userId);
      }
      
      console.log('✅ Tax deadline check completed for all users');
    } catch (error) {
      console.error('❌ Tax deadline check failed:', error);
    }
  }

  // Check tax deadlines for a specific user
  private async checkUserTaxDeadlines(userId: string) {
    try {
      const obligations = await freshDbService.getObligations(userId);
      const profile = await freshDbService.getProfile(userId);
      
      if (!profile || !obligations.length) return;

      const today = new Date();
      const userName = profile.business_name || 'Your Business';
      
      for (const obligation of obligations) {
        if (!obligation.is_active) continue;
        
        const dueDate = new Date(obligation.next_due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminders at 7, 3, and 1 days before
        if ([7, 3, 1].includes(daysUntilDue)) {
          console.log(`📧 Sending ${daysUntilDue}-day reminder for ${obligation.obligation_type} to ${userName}`);
          
          await notificationServiceFixed.sendTaxDeadlineReminder(
            profile.email,
            userName,
            profile.phone || '',
            obligation.obligation_type,
            daysUntilDue,
            obligation.next_due_date
          );
          
          // Log the reminder
          await freshDbService.addReminderLog(userId, {
            obligation_id: obligation.id,
            reminder_type: `${daysUntilDue}_day_reminder`,
            method: 'email_whatsapp'
          });
        }
      }
    } catch (error) {
      console.error(`❌ Tax deadline check failed for user ${userId}:`, error);
    }
  }

  // Check subscription expiries for all users
  private async checkAllSubscriptionExpiries() {
    try {
      console.log('💳 Checking subscription expiries for all users...');
      
      const userIds = await this.getAllUserIds();
      
      for (const userId of userIds) {
        await this.checkUserSubscriptionExpiry(userId);
      }
      
      console.log('✅ Subscription expiry check completed for all users');
    } catch (error) {
      console.error('❌ Subscription expiry check failed:', error);
    }
  }

  // Check subscription expiry for a specific user
  private async checkUserSubscriptionExpiry(userId: string) {
    try {
      const profile = await freshDbService.getProfile(userId);
      
      if (!profile) return;

      // For now, we'll simulate subscription expiry dates
      // In production, this would come from the subscriptions table
      const mockExpiryDate = new Date();
      mockExpiryDate.setDate(mockExpiryDate.getDate() + 7); // Expires in 7 days for testing
      
      const today = new Date();
      const daysUntilExpiry = Math.ceil((mockExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Send reminders at 7, 3, and 1 days before expiry
      if ([7, 3, 1].includes(daysUntilExpiry)) {
        console.log(`💳 Sending ${daysUntilExpiry}-day subscription reminder to ${profile.business_name}`);
        
        await notificationServiceFixed.sendSubscriptionExpiryReminder(
          profile.email,
          profile.business_name || 'Your Business',
          profile.phone || '',
          profile.plan || 'basic',
          daysUntilExpiry
        );
      }
    } catch (error) {
      console.error(`❌ Subscription expiry check failed for user ${userId}:`, error);
    }
  }

  // Schedule onboarding notifications for new users (only after email verification)
  async scheduleUserOnboarding(userId: string, email: string, businessName: string, phone?: string, isEmailVerified: boolean = false) {
    try {
      console.log(`📅 Scheduling onboarding for: ${businessName} (Email verified: ${isEmailVerified})`);
      
      // Only send welcome email if user has verified their email
      if (!isEmailVerified) {
        console.log('⏳ Skipping welcome email - user email not verified yet');
        return;
      }
      
      // 1. Send welcome immediately (only for verified users)
      await notificationServiceFixed.sendWelcomeNotifications(email, businessName, phone);
      
      // 2. Schedule follow-up after 30 minutes
      setTimeout(async () => {
        await notificationServiceFixed.sendFollowUpNotifications(email, businessName, phone);
      }, 30 * 60 * 1000); // 30 minutes
      
      // 3. Schedule educational after 2 hours
      setTimeout(async () => {
        await notificationServiceFixed.sendEducationalNotifications(email, businessName, phone);
      }, 2 * 60 * 60 * 1000); // 2 hours
      
      console.log('✅ Onboarding notifications scheduled for verified user');
    } catch (error) {
      console.error('❌ Failed to schedule onboarding:', error);
    }
  }

  // Manual trigger for testing specific user
  async triggerUserDeadlineCheck(userId: string) {
    console.log(`🧪 Manual trigger: Checking deadlines for user ${userId}`);
    await this.checkUserTaxDeadlines(userId);
  }

  // Manual trigger for testing onboarding
  async triggerTestOnboarding(email: string, businessName: string, phone?: string) {
    console.log('🧪 Manual trigger: Testing onboarding notifications');
    
    // Send all notifications immediately for testing
    await notificationServiceFixed.sendWelcomeNotifications(email, businessName, phone);
    
    setTimeout(async () => {
      await notificationServiceFixed.sendFollowUpNotifications(email, businessName, phone);
    }, 5000); // 5 seconds for testing
    
    setTimeout(async () => {
      await notificationServiceFixed.sendEducationalNotifications(email, businessName, phone);
    }, 10000); // 10 seconds for testing
  }

  // Helper method to get all user IDs (mock implementation)
  private async getAllUserIds(): Promise<string[]> {
    // In production, this would query the database for all user IDs
    // For now, return empty array since we're using clean architecture
    return [];
  }

  // Get status of automation system
  getStatus() {
    return {
      isRunning: this.isRunning,
      taxRemindersActive: !!this.taxReminderInterval,
      subscriptionRemindersActive: !!this.subscriptionInterval,
      services: [
        '📧 Email notifications (Direct HTTP)',
        '📱 WhatsApp notifications (Twilio)',
        '📅 Tax deadline reminders (7, 3, 1 days)',
        '💳 Subscription expiry reminders (7, 3, 1 days)',
        '🎉 User onboarding sequence'
      ]
    };
  }
}

export const comprehensiveAutomationService = new ComprehensiveAutomationService();