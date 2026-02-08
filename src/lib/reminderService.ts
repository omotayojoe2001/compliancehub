import { supabase } from './supabase';
import { emailService } from './emailService';
import { twilioWhatsAppService } from './twilioWhatsAppService';
import { planRestrictionsService } from './planRestrictionsService';

interface TaxObligation {
  id: string;
  user_id: string;
  obligation_type: string;
  frequency: string;
  next_due_date: string;
  is_active: boolean;
}

interface ReminderSchedule {
  obligation_type: string;
  frequency: string;
  due_day: number; // Day of month when due
  reminder_days: number[]; // Days before due date to send reminders
}

// Nigerian tax deadlines
const TAX_SCHEDULES: ReminderSchedule[] = [
  {
    obligation_type: 'VAT',
    frequency: 'monthly',
    due_day: 21, // 21st of following month
    reminder_days: [7, 3, 1] // 7, 3, 1 days before
  },
  {
    obligation_type: 'PAYE',
    frequency: 'monthly', 
    due_day: 10, // 10th of following month
    reminder_days: [7, 3, 1]
  },
  {
    obligation_type: 'WHT',
    frequency: 'monthly',
    due_day: 21, // 21st of following month
    reminder_days: [7, 3, 1]
  },
  {
    obligation_type: 'CAC',
    frequency: 'yearly',
    due_day: 31, // Based on incorporation date
    reminder_days: [30, 14, 7, 1] // More reminders for yearly
  }
];

export const reminderService = {
  // Initialize tax obligations for a user (removed automatic creation)
  async initializeUserObligations(userId: string, profile: any) {
    console.log('📅 User profile setup complete. Tax obligations can be added manually from dashboard.');
    // No longer auto-creates obligations - user must add them manually
  },

  // Manually add a tax obligation for a specific period (keep existing function)
  async addTaxObligation(userId: string, obligationType: string, taxPeriod: string, userPlan: string = 'enterprise', companyId?: string) {
    // Always fetch the latest plan from subscriptions table ONLY
    let truePlan = 'enterprise'; // Default to enterprise for full access
    
    try {
      console.log(`🔍 Checking subscription for user: ${userId}`);
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('❌ User subscription query failed:', error);
        console.log(`📋 Using default enterprise plan for full access`);
        truePlan = 'enterprise';
      } else if (subscription) {
        truePlan = subscription.plan_type || 'enterprise';
        console.log(`✅ Found user subscription: ${truePlan}`);
      }
    } catch (error) {
      console.error('❌ Subscription check failed completely:', error);
      console.log(`📋 Using default enterprise plan for full access`);
      truePlan = 'enterprise';
    }

    console.log(`🎯 Final plan detected: ${truePlan}`);
    console.log(`📊 Checking plan limits for: ${truePlan}`);

    // Count obligations for this company
    let query = supabase
      .from('tax_obligations')
      .select('*')
      .eq('user_id', userId);
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    const { data: existingObligations } = await query;
    const obligationCount = existingObligations?.length || 0;

    // Only keep essential debug log
    // console.log(`Plan check: ${truePlan} plan, ${obligationCount} existing obligations for company ${companyId}`);

    if (!planRestrictionsService.canCreateObligation(truePlan, obligationCount)) {
      throw new Error(`Plan limit reached. Your ${truePlan} plan allows limited obligations. Upgrade to add more.`);
    }
    
    // Calculate due date based on tax period
    const dueDate = this.calculateDueDateForPeriod(obligationType, taxPeriod);
    
    const obligationData: any = {
      user_id: userId,
      obligation_type: obligationType,
      frequency: obligationType === 'CAC' ? 'yearly' : 'monthly',
      next_due_date: dueDate,
      tax_period: taxPeriod,
      is_active: true
    };
    
    // Add company_id if provided
    if (companyId) {
      obligationData.company_id = companyId;
    }
    
    const { error } = await supabase
      .from('tax_obligations')
      .insert(obligationData);
    
    if (error) throw error;
    
    console.log(`📅 Added ${obligationType} obligation for period ${taxPeriod}${companyId ? ` (Company: ${companyId})` : ''}`);
  },

  // Manually add a tax obligation for ongoing monitoring
  async addOngoingTaxObligation(userId: string, obligationType: string, userPlan: string = 'free') {
    // Check plan limits
    const { data: existingObligations } = await supabase
      .from('tax_obligations')
      .select('*')
      .eq('user_id', userId)
      .eq('obligation_type', obligationType)
      .eq('is_ongoing', true);
    
    if (existingObligations && existingObligations.length > 0) {
      throw new Error(`You already have ongoing ${obligationType} monitoring enabled.`);
    }
    
    const { data: allObligations } = await supabase
      .from('tax_obligations')
      .select('*')
      .eq('user_id', userId);
    
    const obligationCount = allObligations?.length || 0;
    
    if (!planRestrictionsService.canCreateObligation(userPlan, obligationCount)) {
      throw new Error('Plan limit reached. Upgrade to add more tax obligations.');
    }
    
    // Calculate next due date
    const dueDate = this.calculateNextDueDate(obligationType, 'monthly');
    
    const { error } = await supabase
      .from('tax_obligations')
      .insert({
        user_id: userId,
        obligation_type: obligationType,
        frequency: obligationType === 'CAC' ? 'yearly' : 'monthly',
        next_due_date: dueDate,
        is_active: true,
        is_ongoing: true, // This marks it as ongoing monitoring
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    console.log(`📅 Added ongoing ${obligationType} monitoring`);
  },

  // Calculate due date for a specific tax period
  calculateDueDateForPeriod(obligationType: string, taxPeriod: string): string {
    const schedule = TAX_SCHEDULES.find(s => s.obligation_type === obligationType);
    if (!schedule) throw new Error('Unknown obligation type');
    
    // Parse tax period (e.g., "2024-12" for December 2024)
    const [year, month] = taxPeriod.split('-').map(Number);
    
    if (obligationType === 'CAC') {
      // CAC due 42 days after anniversary
      const anniversary = new Date(year, month - 1, 1);
      return new Date(anniversary.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    // Monthly taxes due in following month
    let dueMonth = month;
    let dueYear = year;
    
    if (dueMonth === 12) {
      dueMonth = 1;
      dueYear++;
    } else {
      dueMonth++;
    }
    
    return new Date(dueYear, dueMonth - 1, schedule.due_day).toISOString().split('T')[0];
  },

  // Calculate next due date for monthly obligations
  calculateNextDueDate(type: string, frequency: string): string {
    const now = new Date();
    const schedule = TAX_SCHEDULES.find(s => s.obligation_type === type);
    
    if (!schedule) return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (frequency === 'monthly') {
      // For Nigerian taxes: VAT/WHT due 21st of following month, PAYE due 10th of following month
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Calculate due date for current tax period
      let dueMonth = currentMonth + 1; // Next month
      let dueYear = currentYear;
      
      // Handle year rollover
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear++;
      }
      
      const dueDate = new Date(dueYear, dueMonth, schedule.due_day);
      
      // If due date has passed, calculate for next period
      if (dueDate <= now) {
        dueMonth++;
        if (dueMonth > 11) {
          dueMonth = 0;
          dueYear++;
        }
        return new Date(dueYear, dueMonth, schedule.due_day).toISOString().split('T')[0];
      }
      
      return dueDate.toISOString().split('T')[0];
    }
    
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  },

  // Calculate CAC due date based on incorporation date
  calculateCACDueDate(cacDate: string): string {
    const incorporationDate = new Date(cacDate);
    const currentYear = new Date().getFullYear();
    
    // CAC annual return is due within 42 days after anniversary
    const anniversaryThisYear = new Date(currentYear, incorporationDate.getMonth(), incorporationDate.getDate());
    const dueDate = new Date(anniversaryThisYear.getTime() + 42 * 24 * 60 * 60 * 1000);
    
    // If due date has passed this year, calculate for next year
    if (dueDate < new Date()) {
      const anniversaryNextYear = new Date(currentYear + 1, incorporationDate.getMonth(), incorporationDate.getDate());
      const dueDateNextYear = new Date(anniversaryNextYear.getTime() + 42 * 24 * 60 * 60 * 1000);
      return dueDateNextYear.toISOString().split('T')[0];
    }
    
    return dueDate.toISOString().split('T')[0];
  },

  // Check for upcoming deadlines and schedule reminders
  async checkAndScheduleReminders() {
    console.log('🔔 Checking for upcoming deadlines...');
    
    const { data: obligations, error } = await supabase
      .from('tax_obligations')
      .select('*')
      .eq('is_active', true);
      
    if (error) {
      console.error('🔔 Failed to fetch obligations:', error);
      return;
    }
    
    for (const obligation of obligations || []) {
      // Get profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, business_name')
        .eq('id', obligation.user_id)
        .single();
        
      if (profile) {
        await this.scheduleRemindersForObligation({ ...obligation, profiles: profile });
      }
    }
  },

  // Schedule reminders for a specific obligation
  async scheduleRemindersForObligation(obligation: any) {
    const dueDate = new Date(obligation.next_due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const schedule = TAX_SCHEDULES.find(s => s.obligation_type === obligation.obligation_type);
    if (!schedule) return;
    
    // Check if we should send a reminder today
    if (schedule.reminder_days.includes(daysUntilDue)) {
      await this.sendReminder(obligation, daysUntilDue);
    }
  },

  // Send reminder email/WhatsApp
  async sendReminder(obligation: any, daysUntilDue: number) {
    console.log(`🔔 Sending ${obligation.obligation_type} reminder - ${daysUntilDue} days until due`);
    
    // Get user's plan from subscriptions table ONLY
    let userPlan = 'enterprise'; // Default to enterprise for full access
    
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', obligation.user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (subscription) {
        userPlan = subscription.plan_type || 'enterprise';
      }
    } catch (error) {
      console.error('Failed to fetch user plan, using enterprise default:', error);
      userPlan = 'enterprise';
    }
    
    const canSendEmail = planRestrictionsService.canAccessFeature(userPlan, 'hasEmailReminders');
    const canSendWhatsApp = planRestrictionsService.canAccessFeature(userPlan, 'hasWhatsAppReminders');
    
    if (!canSendEmail && !canSendWhatsApp) {
      console.log('🔔 No reminder permissions for plan:', userPlan);
      return;
    }
    
    const reminderMessage = this.generateReminderMessage(obligation.obligation_type, daysUntilDue);
    
    try {
      // Send email reminder if allowed
      if (canSendEmail) {
        await emailService.sendReminderEmail({
          to: obligation.profiles.email,
          businessName: obligation.profiles.business_name,
          obligationType: obligation.obligation_type,
          daysUntilDue,
          dueDate: obligation.next_due_date
        });
        
        console.log('🔔 Email reminder sent');
      }
      
      // Send WhatsApp reminder if allowed
      if (canSendWhatsApp) {
        const { data: profileWithPhone } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', obligation.user_id)
          .single();
          
        if (profileWithPhone?.phone) {
          await twilioWhatsAppService.sendTaxReminder(
            profileWithPhone.phone,
            obligation.obligation_type,
            new Date(obligation.next_due_date).toLocaleDateString(),
            daysUntilDue
          );
          console.log('🔔 WhatsApp reminder sent via Twilio');
        }
      }
      
      // Log the reminder
      await supabase
        .from('reminder_logs')
        .insert({
          user_id: obligation.user_id,
          obligation_id: obligation.id,
          reminder_type: canSendWhatsApp ? 'whatsapp' : 'email',
          scheduled_date: new Date().toISOString(),
          sent_date: new Date().toISOString(),
          status: 'sent',
          message_content: reminderMessage
        });
        
      console.log('🔔 Reminder sent successfully');
    } catch (error) {
      console.error('🔔 Failed to send reminder:', error);
      
      // Log the failure
      await supabase
        .from('reminder_logs')
        .insert({
          user_id: obligation.user_id,
          obligation_id: obligation.id,
          reminder_type: 'email',
          scheduled_date: new Date().toISOString(),
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          message_content: reminderMessage
        });
    }
  },

  // Generate reminder message
  generateReminderMessage(obligationType: string, daysUntilDue: number): string {
    const urgency = daysUntilDue <= 1 ? 'URGENT' : daysUntilDue <= 3 ? 'Important' : 'Reminder';
    
    return `${urgency}: Your ${obligationType} filing is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}. Please file before the deadline to avoid penalties.`;
  }
};