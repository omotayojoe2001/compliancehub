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

  // Schedule onboarding notifications for new users
  async scheduleUserOnboarding(userId: string, email: string, businessName: string, phone?: string) {
    try {
      console.log(`📅 Scheduling onboarding for: ${businessName}`);
      
      // 1. Send welcome immediately
      await notificationServiceFixed.sendWelcomeNotifications(email, businessName, phone);
      
      // 2. Schedule follow-up after 30 minutes
      setTimeout(async () => {
        await notificationServiceFixed.sendFollowUpNotifications(email, businessName, phone);
      }, 30 * 60 * 1000); // 30 minutes
      
      // 3. Schedule educational after 2 hours
      setTimeout(async () => {
        await notificationServiceFixed.sendEducationalNotifications(email, businessName, phone);
      }, 2 * 60 * 60 * 1000); // 2 hours
      
      console.log('✅ Onboarding notifications scheduled');
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