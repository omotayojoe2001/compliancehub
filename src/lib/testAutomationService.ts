import { automatedReminderScheduler } from './automatedReminderScheduler';
import { subscriptionReminderService } from './subscriptionReminderService';

class TestAutomationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start test automation - runs every 3 minutes
  start() {
    if (this.isRunning) {
      console.log('🧪 Test automation already running');
      return;
    }

    console.log('🧪 Starting TEST automation - will check every 3 minutes');
    
    // Run immediately
    this.runTestCheck();
    
    // Then run every 3 minutes (180,000 ms)
    this.intervalId = setInterval(() => {
      this.runTestCheck();
    }, 3 * 60 * 1000);
    
    this.isRunning = true;
    console.log('🧪 TEST automation started - checking every 3 minutes');
  }

  // Stop test automation
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🧪 TEST automation stopped');
    }
  }

  // Run the test reminder check
  private async runTestCheck() {
    try {
      const now = new Date();
      console.log(`🧪 Running TEST reminder check at ${now.toLocaleTimeString()}`);
      
      await automatedReminderScheduler.triggerManualCheck();
      
      // Check subscription expirations
      await subscriptionReminderService.checkAndSendExpirationReminders();
      
      console.log(`🧪 TEST reminder check completed at ${now.toLocaleTimeString()}`);
    } catch (error) {
      console.error('🧪 TEST reminder check failed:', error);
    }
  }

  // Check if running
  isTestRunning() {
    return this.isRunning;
  }

  // Manual trigger
  async triggerTestNow() {
    console.log('🧪 Manual TEST trigger requested');
    await this.runTestCheck();
  }
}

export const testAutomationService = new TestAutomationService();