import { notificationService } from './notificationService';
import { freshDbService } from './freshDbService';

export const automationScheduler = {
  // Schedule all follow-up notifications for a new user
  async scheduleUserOnboarding(userId: string, email: string, businessName: string, phone?: string) {
    try {
      console.log('📅 Scheduling onboarding notifications for:', businessName);
      
      // 1. Send welcome immediately
      await notificationService.sendWelcomeNotifications(email, businessName, phone);
      
      // 2. Schedule follow-up after 30 minutes
      setTimeout(async () => {
        await notificationService.sendFollowUpNotifications(email, businessName, phone);
      }, 30 * 60 * 1000); // 30 minutes
      
      // 3. Schedule educational after 2 hours
      setTimeout(async () => {
        await notificationService.sendEducationalNotifications(email, businessName, phone);
      }, 2 * 60 * 60 * 1000); // 2 hours
      
      console.log('✅ Onboarding notifications scheduled');
    } catch (error) {
      console.error('❌ Failed to schedule onboarding:', error);
    }
  },

  // Check for tax deadline reminders (runs hourly)
  async checkTaxDeadlineReminders() {
    try {
      console.log('🔔 Checking tax deadline reminders...');
      
      // Get all active tax obligations
      const obligations = await this.getAllActiveObligations();
      
      for (const obligation of obligations) {
        const daysUntilDue = this.calculateDaysUntilDue(obligation.due_date);
        
        // Send reminders at 7, 3, 1 days before
        if ([7, 3, 1].includes(daysUntilDue)) {
          const profile = await freshDbService.getProfile(obligation.user_id);
          
          if (profile) {
            await notificationService.sendTaxDeadlineReminder(
              profile.email,
              profile.business_name || 'Your Business',
              profile.phone || '',
              obligation.tax_type,
              daysUntilDue,
              obligation.due_date
            );
            
            console.log(`📧 Sent ${obligation.tax_type} reminder (${daysUntilDue} days) to ${profile.business_name}`);
          }
        }
      }
      
      console.log('✅ Tax deadline reminders checked');
    } catch (error) {
      console.error('❌ Tax deadline reminder check failed:', error);
    }
  },

  // Check for subscription expiry reminders (runs daily)
  async checkSubscriptionExpiryReminders() {
    try {
      console.log('💳 Checking subscription expiry reminders...');
      
      // Get all active subscriptions (mock data for now)
      const subscriptions = await this.getAllActiveSubscriptions();
      
      for (const subscription of subscriptions) {
        const daysUntilExpiry = this.calculateDaysUntilDue(subscription.next_payment_date);
        
        // Send reminders at 7, 3, 1 days before expiry
        if ([7, 3, 1].includes(daysUntilExpiry)) {
          const profile = await freshDbService.getProfile(subscription.user_id);
          
          if (profile) {
            await notificationService.sendSubscriptionExpiryReminder(
              profile.email,
              profile.business_name || 'Your Business',
              profile.phone || '',
              profile.plan || 'basic',
              daysUntilExpiry
            );
            
            console.log(`💳 Sent subscription expiry reminder (${daysUntilExpiry} days) to ${profile.business_name}`);
          }
        }
      }
      
      console.log('✅ Subscription expiry reminders checked');
    } catch (error) {
      console.error('❌ Subscription expiry reminder check failed:', error);
    }
  },

  // Start the automation system
  startAutomation() {
    console.log('🤖 Starting ComplianceHub automation system...');
    
    // Check tax deadlines every hour
    setInterval(() => {
      this.checkTaxDeadlineReminders();
    }, 60 * 60 * 1000); // 1 hour
    
    // Check subscription expiry every 6 hours
    setInterval(() => {
      this.checkSubscriptionExpiryReminders();
    }, 6 * 60 * 60 * 1000); // 6 hours
    
    // Run initial checks
    this.checkTaxDeadlineReminders();
    this.checkSubscriptionExpiryReminders();
    
    console.log('✅ Automation system started');
  },

  // Helper functions
  async getAllActiveObligations() {
    // This would normally query the database
    // For now, return empty array since we're using clean architecture
    return [];
  },

  async getAllActiveSubscriptions() {
    // This would normally query the database
    // For now, return empty array since we're using clean architecture
    return [];
  },

  calculateDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Manual trigger for testing
  async triggerTestNotifications(email: string, businessName: string, phone?: string) {
    console.log('🧪 Triggering test notifications...');
    
    // Test welcome
    await notificationService.sendWelcomeNotifications(email, businessName, phone);
    
    // Test follow-up (immediate for testing)
    setTimeout(async () => {
      await notificationService.sendFollowUpNotifications(email, businessName, phone);
    }, 5000); // 5 seconds for testing
    
    // Test educational (immediate for testing)
    setTimeout(async () => {
      await notificationService.sendEducationalNotifications(email, businessName, phone);
    }, 10000); // 10 seconds for testing
    
    console.log('✅ Test notifications triggered');
  }
};