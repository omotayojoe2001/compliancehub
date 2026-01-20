// VAT Notification Automation Service
// This would run daily via Supabase Cron Jobs

export interface NotificationSchedule {
  day: number; // Day of month
  type: 'email' | 'whatsapp' | 'both';
  category: 'welcome' | 'educational' | 'reminder' | 'urgent' | 'overdue';
  subject: string;
  content: string;
}

export const VAT_NOTIFICATION_SCHEDULE: NotificationSchedule[] = [
  {
    day: 1,
    type: 'email',
    category: 'welcome',
    subject: 'New Month Started - VAT Due 21st',
    content: 'Hello! A new month has begun. Your VAT return is due on the 21st. Start gathering your records early to avoid last-minute stress.'
  },
  {
    day: 7,
    type: 'both',
    category: 'educational',
    subject: 'VAT Tips: Maximize Your Deductions',
    content: 'Educational content: Learn which expenses are VAT deductible. Keep proper receipts for office supplies, utilities, and business meals.'
  },
  {
    day: 10,
    type: 'both',
    category: 'educational', 
    subject: 'VAT Record Keeping Best Practices',
    content: 'Educational content: Organize your invoices by date. Separate input VAT from output VAT. Use our digital cashbook to track everything.'
  },
  {
    day: 14,
    type: 'both',
    category: 'reminder',
    subject: 'VAT Due in 7 Days - Start Preparing',
    content: 'Your VAT return is due in 7 days (21st). Start preparing your returns now. Calculate your VAT liability using our smart calculator.'
  },
  {
    day: 18,
    type: 'both',
    category: 'urgent',
    subject: 'VAT Due in 3 Days - File Now!',
    content: 'URGENT: VAT due in 3 days! File your returns now to avoid ₦50,000 penalties. Need help? Our tax consultants are available.'
  },
  {
    day: 19,
    type: 'both',
    category: 'urgent',
    subject: 'VAT Due in 2 Days - Last Chance',
    content: 'CRITICAL: VAT due in 2 days! This is your last chance to file without penalties. File today!'
  },
  {
    day: 20,
    type: 'both',
    category: 'urgent',
    subject: 'VAT Due TOMORROW - File Today!',
    content: 'FINAL WARNING: VAT due TOMORROW! File your returns today. Penalties start from midnight on the 22nd.'
  }
];

export const VAT_CRITICAL_DAYS_SCHEDULE = [
  // 18th - 2 notifications
  {
    day: 18,
    time: '09:00',
    type: 'both',
    subject: 'VAT Due in 3 Days - Morning Alert',
    content: 'URGENT: VAT due in 3 days! File your returns now to avoid ₦50,000 penalties.'
  },
  {
    day: 18,
    time: '21:00',
    type: 'both', 
    subject: 'VAT Due in 3 Days - Evening Alert',
    content: 'URGENT REMINDER: VAT due in 3 days! Don\'t wait - file tonight to avoid penalties.'
  },
  
  // 19th - 2 notifications
  {
    day: 19,
    time: '09:00',
    type: 'both',
    subject: 'VAT Due in 2 Days - Morning Alert',
    content: 'CRITICAL: VAT due in 2 days! This is your last chance to file without penalties.'
  },
  {
    day: 19,
    time: '21:00',
    type: 'both',
    subject: 'VAT Due in 2 Days - Evening Alert', 
    content: 'CRITICAL REMINDER: VAT due in 2 days! File immediately to avoid penalties.'
  },
  
  // 20th - 2 notifications
  {
    day: 20,
    time: '09:00',
    type: 'both',
    subject: 'VAT Due TOMORROW - Morning Warning',
    content: 'FINAL WARNING: VAT due TOMORROW! File your returns today to avoid penalties.'
  },
  {
    day: 20,
    time: '21:00',
    type: 'both',
    subject: 'VAT Due TOMORROW - Evening Warning',
    content: 'FINAL WARNING: VAT due TOMORROW! Last chance to file tonight - penalties start at midnight on 22nd.'
  }
];

export const VAT_DUE_DAY_SCHEDULE = [
  // 21st - 3 notifications
  {
    day: 21,
    time: '09:00',
    type: 'both',
    subject: 'VAT DUE TODAY - Morning Alert',
    content: 'VAT is DUE TODAY! You have until midnight to file your returns. File now!'
  },
  {
    day: 21,
    time: '18:00', 
    type: 'both',
    subject: 'VAT DUE TODAY - 6 Hours Left',
    content: 'Only 6 hours left to file VAT! File immediately to avoid ₦50,000+ penalties.'
  },
  {
    day: 21,
    time: '23:00',
    type: 'both', 
    subject: 'VAT DUE TODAY - 1 HOUR LEFT!',
    content: '🚨 EMERGENCY: Only 1 HOUR LEFT to file VAT! File RIGHT NOW or face severe penalties!'
  }
];

export const VAT_OVERDUE_SCHEDULE = [
  { days: 1, subject: 'VAT 1 Day Overdue - File Immediately', penalty: '₦50,000' },
  { days: 3, subject: 'VAT 3 Days Overdue - Penalties Applying', penalty: '₦100,000+' },
  { days: 7, subject: 'VAT 1 Week Overdue - Serious Penalties', penalty: '₦200,000+' },
  { days: 14, subject: 'VAT 2 Weeks Overdue - Contact FIRS', penalty: '₦500,000+' },
  // Then weekly until marked paid
];

class VATNotificationAutomation {
  
  async checkAndSendDailyNotifications() {
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Get all users with VAT obligations
    const vatUsers = await this.getUsersWithVATObligations();
    
    for (const user of vatUsers) {
      // Check if VAT is due this month
      const vatDueDate = this.getVATDueDate(user);
      
      if (this.isVATMonth(vatDueDate)) {
        await this.sendScheduledNotifications(user, dayOfMonth);
      }
      
      // Check for overdue VAT
      if (this.isVATOverdue(user)) {
        await this.sendOverdueNotifications(user);
      }
    }
  }
  
  async sendScheduledNotifications(user: any, dayOfMonth: number) {
    const notification = VAT_NOTIFICATION_SCHEDULE.find(n => n.day === dayOfMonth);
    
    if (notification) {
      if (notification.type === 'email' || notification.type === 'both') {
        await this.sendEmail(user, notification);
      }
      
      if (notification.type === 'whatsapp' || notification.type === 'both') {
        await this.sendWhatsApp(user, notification);
      }
    }
    
    // Special handling for due date (21st)
    if (dayOfMonth === 21) {
      await this.sendDueDateNotifications(user);
    }
  }
  
  async sendDueDateNotifications(user: any) {
    const now = new Date();
    const hour = now.getHours();
    
    // Morning notification (9 AM)
    if (hour === 9) {
      await this.sendEmail(user, VAT_DUE_DAY_SCHEDULE[0]);
      await this.sendWhatsApp(user, VAT_DUE_DAY_SCHEDULE[0]);
    }
    
    // Evening notification (6 PM)  
    if (hour === 18) {
      await this.sendEmail(user, VAT_DUE_DAY_SCHEDULE[1]);
      await this.sendWhatsApp(user, VAT_DUE_DAY_SCHEDULE[1]);
    }
  }
  
  async sendOverdueNotifications(user: any) {
    const daysOverdue = this.getDaysOverdue(user);
    const overdueNotification = VAT_OVERDUE_SCHEDULE.find(n => n.days === daysOverdue);
    
    if (overdueNotification) {
      const content = `Your VAT is ${daysOverdue} days overdue! Penalties: ${overdueNotification.penalty}. File immediately to minimize penalties.`;
      
      await this.sendEmail(user, {
        subject: overdueNotification.subject,
        content: content
      });
      
      await this.sendWhatsApp(user, {
        subject: overdueNotification.subject, 
        content: content
      });
    }
  }
  
  // Helper methods would be implemented here
  async getUsersWithVATObligations() { /* Implementation */ }
  async sendEmail(user: any, notification: any) { /* Implementation */ }
  async sendWhatsApp(user: any, notification: any) { /* Implementation */ }
  // ... other helper methods
}

export const vatNotificationAutomation = new VATNotificationAutomation();