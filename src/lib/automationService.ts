import { automatedReminderScheduler } from './automatedReminderScheduler';
import { subscriptionReminderService } from './subscriptionReminderService';

// This runs the automated reminder system every hour
const REMINDER_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

class AutomationService {
  private intervalId: NodeJS.Timeout | null = null;

  // Start the automated reminder system
  start() {
    console.log('🤖 Starting automated reminder system...');
    
    // Run immediately on start
    this.runReminderCheck();
    
    // Then run every hour
    this.intervalId = setInterval(() => {
      this.runReminderCheck();
    }, REMINDER_CHECK_INTERVAL);
    
    console.log('🤖 Automated reminder system started - checking every hour');
  }

  // Stop the automated system
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🤖 Automated reminder system stopped');
    }
  }

  // Run the reminder check
  private async runReminderCheck() {
    try {
      console.log('🤖 Running automated reminder check...');
      await automatedReminderScheduler.triggerManualCheck();
      
      // Check subscription expirations
      await subscriptionReminderService.checkAndSendExpirationReminders();
      
      console.log('🤖 Automated reminder check completed');
    } catch (error) {
      console.error('🤖 Automated reminder check failed:', error);
    }
  }

  // Manual trigger for testing
  async triggerNow() {
    console.log('🤖 Manual trigger requested');
    await this.runReminderCheck();
  }
}

export const automationService = new AutomationService();

// Auto-start when the app loads - DISABLED
// if (typeof window !== 'undefined') {
//   // Start automation when app loads
//   setTimeout(() => {
//     automationService.start();
//   }, 5000); // Wait 5 seconds after app loads
// }