import { supabase } from './supabase';

export interface PlanLimits {
  businessProfiles: number;
  taxObligations: number;
  hasReminders: boolean;
  hasWhatsAppReminders: boolean;
  hasAdvancedCalculator: boolean;
  hasApiAccess: boolean;
  hasMultiUserAccess: boolean;
  hasPrioritySupport: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    businessProfiles: 0, // View only
    taxObligations: 0, // View only
    hasReminders: false,
    hasWhatsAppReminders: false,
    hasAdvancedCalculator: false,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  basic: {
    businessProfiles: 1,
    taxObligations: 3,
    hasReminders: true,
    hasWhatsAppReminders: false,
    hasAdvancedCalculator: false,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  pro: {
    businessProfiles: 5,
    taxObligations: -1, // Unlimited
    hasReminders: true,
    hasWhatsAppReminders: true,
    hasAdvancedCalculator: true,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: true,
  },
  enterprise: {
    businessProfiles: -1, // Unlimited
    taxObligations: -1, // Unlimited
    hasReminders: true,
    hasWhatsAppReminders: true,
    hasAdvancedCalculator: true,
    hasApiAccess: true,
    hasMultiUserAccess: true,
    hasPrioritySupport: true,
  },
};

export class PlanEnforcementService {
  static async getCurrentUserPlan(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'free';

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    return subscription?.plan_type || 'free';
  }

  static async enforcePlanLimits(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const planType = await this.getCurrentUserPlan();
    const limits = PLAN_LIMITS[planType];

    // Enforce business profile limits
    if (limits.businessProfiles >= 0) {
      const { data: profiles } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (profiles && profiles.length > limits.businessProfiles) {
        const excessProfiles = profiles.slice(limits.businessProfiles);
        await supabase
          .from('business_profiles')
          .update({ is_active: false })
          .in('id', excessProfiles.map(p => p.id));
      }
    }

    // Enforce tax obligation limits
    if (limits.taxObligations >= 0) {
      const { data: obligations } = await supabase
        .from('tax_obligations')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (obligations && obligations.length > limits.taxObligations) {
        const excessObligations = obligations.slice(limits.taxObligations);
        await supabase
          .from('tax_obligations')
          .update({ is_active: false })
          .in('id', excessObligations.map(o => o.id));
      }
    }
  }

  static getPlanLimits(planType: string): PlanLimits {
    return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
  }

  static canCreateBusinessProfile(planType: string, currentCount: number): boolean {
    const limits = PLAN_LIMITS[planType];
    return limits.businessProfiles === -1 || currentCount < limits.businessProfiles;
  }

  static canCreateTaxObligation(planType: string, currentCount: number): boolean {
    const limits = PLAN_LIMITS[planType];
    return limits.taxObligations === -1 || currentCount < limits.taxObligations;
  }

  static async fixSubscriptionInconsistency(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current subscription
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    // If multiple subscriptions exist, keep only the latest
    if (subscriptions && subscriptions.length > 1) {
      const latest = subscriptions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      // Delete all except the latest
      const toDelete = subscriptions.filter(s => s.id !== latest.id);
      await supabase
        .from('subscriptions')
        .delete()
        .in('id', toDelete.map(s => s.id));
    }

    // If no subscription exists, create free plan
    if (!subscriptions || subscriptions.length === 0) {
      await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
          amount: 0
        });
    }
  }
}