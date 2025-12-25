import { supabase } from './supabase';

export const dataExportService = {
  // Export all user data to CSV format
  async exportUserData(userId: string): Promise<string> {
    try {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get obligations
      const { data: obligations } = await supabase
        .from('tax_obligations')
        .select('*')
        .eq('user_id', userId);

      // Get subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get reminder logs
      const { data: reminders } = await supabase
        .from('reminder_logs')
        .select('*')
        .eq('user_id', userId);

      // Create CSV content
      let csvContent = '';
      
      // Profile section
      csvContent += 'BUSINESS PROFILE\n';
      csvContent += 'Business Name,Phone,Email,CAC Date,VAT Status,PAYE Status,Plan,Subscription Status\n';
      csvContent += `"${profile?.business_name}","${profile?.phone}","${profile?.email}","${profile?.cac_date}","${profile?.vat_status}","${profile?.paye_status}","${profile?.plan}","${profile?.subscription_status}"\n\n`;

      // Subscription section
      if (subscription) {
        csvContent += 'SUBSCRIPTION DETAILS\n';
        csvContent += 'Plan Type,Status,Amount,Next Payment Date,Reference\n';
        csvContent += `"${subscription.plan_type}","${subscription.status}","${subscription.amount}","${subscription.next_payment_date}","${subscription.paystack_subscription_code}"\n\n`;
      }

      // Obligations section
      if (obligations && obligations.length > 0) {
        csvContent += 'TAX OBLIGATIONS\n';
        csvContent += 'Obligation Type,Frequency,Next Due Date,Active Status\n';
        obligations.forEach(ob => {
          csvContent += `"${ob.obligation_type}","${ob.frequency}","${ob.next_due_date}","${ob.is_active}"\n`;
        });
        csvContent += '\n';
      }

      // Reminders section
      if (reminders && reminders.length > 0) {
        csvContent += 'REMINDER HISTORY\n';
        csvContent += 'Obligation Type,Reminder Type,Sent Date,Status\n';
        reminders.forEach(rem => {
          csvContent += `"${rem.obligation_type}","${rem.reminder_type}","${rem.sent_at}","${rem.status}"\n`;
        });
      }

      return csvContent;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  // Download CSV file
  downloadCSV(csvContent: string, filename: string = 'compliance-data.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export all users data (admin function)
  async exportAllUsersData(): Promise<string> {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          *,
          subscriptions(*),
          tax_obligations(*)
        `);

      let csvContent = 'ALL USERS DATA\n';
      csvContent += 'Business Name,Email,Phone,Plan,Subscription Status,VAT Status,PAYE Status,CAC Date,Obligations Count\n';
      
      profiles?.forEach(profile => {
        const obligationsCount = profile.tax_obligations?.length || 0;
        csvContent += `"${profile.business_name}","${profile.email}","${profile.phone}","${profile.plan}","${profile.subscription_status}","${profile.vat_status}","${profile.paye_status}","${profile.cac_date}","${obligationsCount}"\n`;
      });

      return csvContent;
    } catch (error) {
      console.error('Export all users failed:', error);
      throw error;
    }
  }
};