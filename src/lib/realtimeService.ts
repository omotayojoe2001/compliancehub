import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export const realtimeService = {
  // Tax Obligations Real-time
  subscribeToObligations(userId: string, callback: (payload: any) => void): RealtimeSubscription {
    const channel = supabase
      .channel(`obligations_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tax_obligations',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => supabase.removeChannel(channel)
    };
  },

  // Reminders Real-time
  subscribeToReminders(userId: string, callback: (payload: any) => void): RealtimeSubscription {
    const channel = supabase
      .channel(`reminders_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminder_logs',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => supabase.removeChannel(channel)
    };
  },

  // Profile Real-time
  subscribeToProfile(userId: string, callback: (payload: any) => void): RealtimeSubscription {
    const channel = supabase
      .channel(`profile_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => supabase.removeChannel(channel)
    };
  },

  // Subscriptions Real-time
  subscribeToSubscriptions(userId: string, callback: (payload: any) => void): RealtimeSubscription {
    const channel = supabase
      .channel(`subscriptions_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => supabase.removeChannel(channel)
    };
  },

  // Expenses Real-time
  subscribeToExpenses(userId: string, callback: (payload: any) => void): RealtimeSubscription {
    const channel = supabase
      .channel(`expenses_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => supabase.removeChannel(channel)
    };
  },

  // Invoices Real-time
  subscribeToInvoices(userId: string, callback: (payload: any) => void): RealtimeSubscription {
    const channel = supabase
      .channel(`invoices_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => supabase.removeChannel(channel)
    };
  },

  // Cashbook Real-time
  subscribeToCashbook(userId: string, callback: (payload: any) => void): RealtimeSubscription {
    const channel = supabase
      .channel(`cashbook_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cashbook_entries',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => supabase.removeChannel(channel)
    };
  }
};