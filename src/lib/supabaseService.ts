import { supabase } from './supabase';

export const supabaseService = {
  // Supabase configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,

  // Input validation helper
  validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Invalid user ID provided');
    }
  },

  validateId(id: string, fieldName = 'ID'): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error(`Invalid ${fieldName} provided`);
    }
  },
  // Tax Obligations
  async getObligations(userId: string, companyId?: string) {
    this.validateUserId(userId);
    if (companyId) this.validateId(companyId, 'Company ID');
    
    const query = supabase
      .from('tax_obligations')
      .select('*')
      .eq('user_id', userId);
    
    if (companyId) {
      query.eq('company_id', companyId);
    }
    
    const { data, error } = await query.order('next_due_date', { ascending: true }).limit(100);
    
    if (error) throw error;
    return data;
  },

  async createObligation(obligation: any) {
    const { data, error } = await supabase
      .from('tax_obligations')
      .insert(obligation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateObligation(id: string, updates: any) {
    this.validateId(id, 'Obligation ID');
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid updates object provided');
    }
    
    const { data, error } = await supabase
      .from('tax_obligations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteObligation(id: string) {
    this.validateId(id, 'Obligation ID');
    
    const { error } = await supabase
      .from('tax_obligations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Reminders
  async getReminders(userId: string, companyId?: string) {
    this.validateUserId(userId);
    if (companyId) this.validateId(companyId, 'Company ID');
    
    console.group('📊 DATABASE DEBUG - Get Reminders');
    console.log('📊 Query parameters:', { userId, companyId, timestamp: new Date().toISOString() });
    
    const query = supabase
      .from('reminder_logs')
      .select(`
        *,
        tax_obligations(
          obligation_type
        )
      `)
      .eq('user_id', userId);
    
    // Only filter by company_id if it's provided and not null
    if (companyId) {
      query.eq('company_id', companyId);
      console.log('🔍 Filtering by company_id:', companyId);
    }
    
    const startTime = Date.now();
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);
    const endTime = Date.now();
    
    console.log('📊 Query results:', {
      duration: `${endTime - startTime}ms`,
      success: !error,
      error: error?.message,
      recordsFound: data?.length || 0,
      records: data?.map(d => ({
        id: d.id,
        type: d.reminder_type,
        sentAt: d.created_at,
        status: d.status
      })) || []
    });
    
    if (error) {
      console.error('❌ Database error:', error);
      console.groupEnd();
      throw error;
    }
    console.groupEnd();
    return data;
  },

  async createReminder(reminder: any) {
    const { data, error } = await supabase
      .from('reminder_logs')
      .insert(reminder)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Profile
  async getProfile(userId: string) {
    this.validateUserId(userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    this.validateUserId(userId);
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid updates object provided');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Companies
  async getUserCompanies(userId: string) {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createCompany(company: any) {
    const { data, error } = await supabase
      .from('company_profiles')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCompany(companyId: string, updates: any) {
    const { data, error } = await supabase
      .from('company_profiles')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscriptions
  async getSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createSubscription(subscription: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSubscription(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Expenses
  async getExpenses(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createExpense(expense: any) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateExpense(id: string, updates: any) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Invoices
  async getInvoices(userId: string) {
    console.log('🔍 supabaseService.getInvoices START', { userId, timestamp: new Date().toISOString() });
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    const endTime = Date.now();
    console.log('🔍 supabaseService.getInvoices END', { 
      duration: `${endTime - startTime}ms`, 
      success: !error, 
      count: data?.length || 0,
      error: error?.message 
    });
    
    if (error) throw error;
    return data;
  },

  async createInvoice(invoice: any) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateInvoice(id: string, updates: any) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Cashbook
  async getCashbookEntries(userId: string, companyId?: string) {
    let query = supabase
      .from('cashbook_entries')
      .select('*')
      .eq('user_id', userId);
    
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    const { data, error } = await query.order('date', { ascending: false }).limit(200);
    
    if (error) throw error;
    return data;
  },

  async createCashbookEntry(entry: any) {
    const { data, error } = await supabase
      .from('cashbook_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCashbookEntry(id: string, updates: any) {
    const { data, error } = await supabase
      .from('cashbook_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCashbookEntry(id: string) {
    const { error } = await supabase
      .from('cashbook_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};