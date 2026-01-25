import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  business_name?: string;
  business_type?: string;
  phone?: string;
  address?: string;
  tin?: string;
  cac_number?: string;
  business_size?: 'small' | 'medium' | 'large';
  industry?: string;
  notification_preferences?: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  security_preferences?: {
    two_factor: boolean;
    login_alerts: boolean;
  };
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  amount_paid?: number;
  auto_renew: boolean;
}

export interface CashbookEntry {
  id?: string;
  user_id: string;
  entry_type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  date: string;
  vat_applicable: boolean;
  vat_amount: number;
  reference_number?: string;
  payment_method?: string;
}

export interface Expense {
  id?: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  receipt_url?: string;
  is_deductible: boolean;
  vat_amount: number;
}

export interface Invoice {
  id?: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_address?: string;
  client_email?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  company_logo_url?: string;
  notes?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface TaxCalculation {
  id?: string;
  user_id: string;
  calculation_type: 'vat' | 'paye' | 'cit' | 'wht' | 'capital_gains';
  input_data: any;
  result_data: any;
  calculated_amount: number;
}

export interface TaxObligation {
  id?: string;
  user_id: string;
  obligation_type: string;
  description?: string;
  due_date: string;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  amount?: number;
  status: 'pending' | 'completed' | 'overdue';
  metadata?: any;
}

export interface CalculatorTemplate {
  id?: string;
  user_id: string;
  template_name: string;
  calculation_type: 'vat' | 'paye' | 'cit' | 'wht' | 'capital_gains';
  template_data: any;
  is_default: boolean;
}

export interface GuideProgress {
  id?: string;
  user_id: string;
  guide_id: string;
  step_id?: string;
  completed: boolean;
  completion_date?: string;
  notes?: string;
}

export interface GuideBookmark {
  id?: string;
  user_id: string;
  guide_id: string;
}

class ComprehensiveDbService {
  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: userId, ...profile })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Subscription Management
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Cashbook Management
  async getCashbookEntries(userId: string): Promise<CashbookEntry[]> {
    const { data, error } = await supabase
      .from('cashbook_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createCashbookEntry(entry: Omit<CashbookEntry, 'id'>): Promise<CashbookEntry> {
    const { data, error } = await supabase
      .from('cashbook_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCashbookEntry(id: string, entry: Partial<CashbookEntry>): Promise<CashbookEntry> {
    const { data, error } = await supabase
      .from('cashbook_entries')
      .update(entry)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteCashbookEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('cashbook_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Expense Management
  async getExpenses(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Invoice Management
  async getInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);
    
    if (error) throw error;
    return data || [];
  }

  async createInvoiceItems(items: Omit<InvoiceItem, 'id'>[]): Promise<InvoiceItem[]> {
    const { data, error } = await supabase
      .from('invoice_items')
      .insert(items)
      .select();
    
    if (error) throw error;
    return data || [];
  }

  async deleteInvoiceItems(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);
    
    if (error) throw error;
  }

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);
    
    if (error) throw error;
  }

  // Tax Obligation Management
  async getTaxObligations(userId: string): Promise<TaxObligation[]> {
    const { data, error } = await supabase
      .from('tax_obligations')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createTaxObligation(userId: string, obligation: {
    obligation_type: string;
    description?: string;
    due_date: string;
    frequency: string;
    amount?: number;
    status: string;
    metadata?: any;
  }): Promise<TaxObligation> {
    const { data, error } = await supabase
      .from('tax_obligations')
      .insert({
        user_id: userId,
        obligation_type: obligation.obligation_type,
        next_due_date: obligation.due_date,
        frequency: obligation.frequency,
        amount_due: obligation.amount,
        payment_status: obligation.status,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteTaxObligation(id: string): Promise<void> {
    const { error } = await supabase
      .from('tax_obligations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Tax Calculation History
  async getTaxCalculations(userId: string): Promise<TaxCalculation[]> {
    const { data, error } = await supabase
      .from('tax_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveTaxCalculation(calculation: Omit<TaxCalculation, 'id'>): Promise<TaxCalculation> {
    const { data, error } = await supabase
      .from('tax_calculations')
      .insert(calculation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Calculator Templates
  async getCalculatorTemplates(userId: string, type?: string): Promise<CalculatorTemplate[]> {
    let query = supabase
      .from('calculator_templates')
      .select('*')
      .eq('user_id', userId);
    
    if (type) {
      query = query.eq('calculation_type', type);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async saveCalculatorTemplate(template: Omit<CalculatorTemplate, 'id'>): Promise<CalculatorTemplate> {
    const { data, error } = await supabase
      .from('calculator_templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteCalculatorTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('calculator_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Guide Progress Tracking
  async getGuideProgress(userId: string, guideId?: string): Promise<GuideProgress[]> {
    let query = supabase
      .from('guide_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (guideId) {
      query = query.eq('guide_id', guideId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async updateGuideProgress(userId: string, guideId: string, stepId: string, completed: boolean): Promise<GuideProgress> {
    const { data, error } = await supabase
      .from('guide_progress')
      .upsert({
        user_id: userId,
        guide_id: guideId,
        step_id: stepId,
        completed,
        completion_date: completed ? new Date().toISOString() : null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Guide Bookmarks
  async getGuideBookmarks(userId: string): Promise<GuideBookmark[]> {
    const { data, error } = await supabase
      .from('guide_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('bookmarked_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async toggleGuideBookmark(userId: string, guideId: string): Promise<boolean> {
    // Check if bookmark exists
    const { data: existing } = await supabase
      .from('guide_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('guide_id', guideId)
      .single();
    
    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from('guide_bookmarks')
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      return false;
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('guide_bookmarks')
        .insert({ user_id: userId, guide_id: guideId });
      
      if (error) throw error;
      return true;
    }
  }

  // Dashboard Statistics
  async getDashboardStats(userId: string) {
    const [
      subscription,
      obligations,
      reminders,
      cashbookEntries,
      expenses,
      invoices
    ] = await Promise.all([
      this.getUserSubscription(userId),
      supabase.from('tax_obligations').select('*').eq('user_id', userId),
      supabase.from('reminder_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      this.getCashbookEntries(userId),
      this.getExpenses(userId),
      this.getInvoices(userId)
    ]);

    const totalIncome = cashbookEntries
      .filter(entry => entry.entry_type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const pendingObligations = obligations.data?.filter(o => o.payment_status === 'pending').length || 0;
    const overdueObligations = obligations.data?.filter(o => o.payment_status === 'overdue').length || 0;

    return {
      subscription: subscription || { plan_type: 'basic', status: 'trial' },
      totalObligations: obligations.data?.length || 0,
      pendingObligations,
      overdueObligations,
      completedObligations: (obligations.data?.length || 0) - pendingObligations - overdueObligations,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      recentReminders: reminders.data || [],
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
      pendingInvoices: invoices.filter(inv => inv.status === 'sent').length
    };
  }

  // Activity Logging
  async logActivity(userId: string, action: string, description?: string): Promise<void> {
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        description,
        ip_address: null, // Could be populated from request
        user_agent: navigator.userAgent
      });
  }
}

export const comprehensiveDbService = new ComprehensiveDbService();
