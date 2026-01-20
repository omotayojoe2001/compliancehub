import { supabase } from './supabase';

export const supabaseService = {
  // Tax Obligations
  async getObligations(userId: string) {
    const { data, error } = await supabase
      .from('tax_obligations')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true });
    
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
    const { error } = await supabase
      .from('tax_obligations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Reminders
  async getReminders(userId: string) {
    const { data, error } = await supabase
      .from('reminder_logs')
      .select(`
        *,
        tax_obligations(obligation_type)
      `)
      .eq('user_id', userId)
      .order('sent_date', { ascending: false })
      .limit(20);
    
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
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
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
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
  async getCashbookEntries(userId: string) {
    const { data, error } = await supabase
      .from('cashbook_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
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