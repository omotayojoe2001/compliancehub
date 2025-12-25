import { supabase } from '@/lib/supabase';

const SUPABASE_URL = 'https://fyhhcqjclcedpylhyjwy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8';

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_KEY;
  
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const freshDbService = {
  // Profile operations
  async getProfile(userId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      headers
    });
    const data = await response.json();
    console.log('👤 Get profile response:', response.status, data);
    return data[0] || null;
  },

  async saveProfile(userId: string, profile: any) {
    const headers = await getAuthHeaders();
    
    // First try to get existing profile
    const existingProfile = await this.getProfile(userId);
    
    if (existingProfile) {
      // UPDATE existing profile
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(profile)
      });
      console.log('🔄 UPDATE profile response:', response.status, response.statusText);
      return response.ok;
    } else {
      // INSERT new profile
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...profile, id: userId })
      });
      console.log('➕ INSERT profile response:', response.status, response.statusText);
      return response.ok;
    }
  },

  // Tax obligations
  async getObligations(userId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tax_obligations?user_id=eq.${userId}`, {
      headers
    });
    return await response.json();
  },

  async addObligation(userId: string, obligation: any) {
    const headers = await getAuthHeaders();
    
    // Map the data to match tax_obligations table structure
    const payload = {
      user_id: userId,
      obligation_type: obligation.tax_type,
      next_due_date: obligation.due_date,
      tax_period: obligation.tax_period,
      is_active: true
    };
    
    console.log('📝 Adding obligation payload:', payload);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tax_obligations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Add obligation error:', response.status, errorText);
    }
    
    return response.ok;
  },

  // Reminder logs
  async getReminderLogs(userId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reminder_logs?user_id=eq.${userId}&order=created_at.desc`, {
      headers
    });
    const data = await response.json();
    console.log('📋 Get reminder logs response:', response.status, data);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch reminder logs:', data);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  async addReminderLog(userId: string, log: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reminder_logs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...log, user_id: userId })
    });
    return response.ok;
  },

  // Tax obligations with better naming
  async getTaxObligations(userId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tax_obligations?user_id=eq.${userId}&order=next_due_date.asc`, {
      headers
    });
    const data = await response.json();
    console.log('📊 Get tax obligations response:', response.status, data);
    return data.map((item: any) => ({
      id: item.id,
      obligation_type: item.obligation_type,
      due_date: item.next_due_date,
      status: item.is_active ? 'active' : 'inactive',
      tax_period: item.tax_period
    }));
  }
};