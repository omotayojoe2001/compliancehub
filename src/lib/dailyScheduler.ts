import { overdueMonitoringService } from './overdueMonitoringService';
import { comprehensiveAutomationService } from './comprehensiveAutomationService';

export const dailyScheduler = {
  // Run all daily automation tasks
  async runDailyTasks() {
    console.log('🚀 Starting daily automation tasks...');
    
    try {
      // 1. Process overdue obligations (daily persistent reminders)
      await overdueMonitoringService.runDailyOverdueJob();
      
      // 2. Send upcoming deadline reminders (7, 3, 1 days before)
      await comprehensiveAutomationService.processUpcomingReminders();
      
      // 3. Process subscription renewals
      await comprehensiveAutomationService.processSubscriptionReminders();
      
      console.log('✅ Daily automation tasks completed successfully');
    } catch (error) {
      console.error('❌ Error in daily automation tasks:', error);
    }
  },

  // Initialize the scheduler (call this once when app starts)
  initializeScheduler() {
    console.log('⏰ Initializing daily scheduler...');
    
    // Calculate milliseconds until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Run first task at midnight
    setTimeout(() => {
      this.runDailyTasks();
      
      // Then run every 24 hours
      setInterval(() => {
        this.runDailyTasks();
      }, 24 * 60 * 60 * 1000);
      
    }, msUntilMidnight);
    
    console.log(`⏰ Scheduler initialized. Next run in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
  },

  // Manual trigger for testing
  async runNow() {
    console.log('🔧 Manual trigger of daily tasks...');
    await this.runDailyTasks();
  }
};