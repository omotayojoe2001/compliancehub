import { monitoringService } from './monitoringService';
import { reminderService } from './reminderService';

export const automatedReminderScheduler = {
  // Main scheduler function that should run every hour
  async runScheduledCheck(): Promise<void> {
    console.log('🔄 Running automated reminder check...');
    
    try {
      // Check and send reminders for all users
      await reminderService.checkAndScheduleReminders();
      
      // Log the activity
      console.log('✅ Automated reminder check completed');
      
    } catch (error) {
      console.error('❌ Automated reminder check failed:', error);
    }
  },

  // Start the scheduler (runs every hour)
  startScheduler(): void {
    console.log('🚀 Starting automated reminder scheduler...');
    
    // Run immediately
    this.runScheduledCheck();
    
    // Then run every hour (3600000 ms)
    setInterval(() => {
      this.runScheduledCheck();
    }, 3600000); // 1 hour
    
    console.log('✅ Scheduler started - will check every hour');
  },

  // Manual trigger for testing
  async triggerManualCheck(): Promise<void> {
    console.log('🔧 Manual reminder check triggered...');
    await this.runScheduledCheck();
  }
};