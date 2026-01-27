import { supabase } from './supabase';
import { supabaseService } from './supabaseService';

export interface SubscriptionState {
  planType: string;
  status: string;
  isActive: boolean;
  features: {
    businessProfiles: number;
    taxObligations: number;
    hasReminders: boolean;
    hasWhatsAppReminders: boolean;
    hasAdvancedCalculator: boolean;
    hasApiAccess: boolean;
    hasMultiUserAccess: boolean;
    hasPrioritySupport: boolean;
  };
}

export const PLAN_FEATURES = {
  free: {
    businessProfiles: 0,
    taxObligations: 0,
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
    hasAdvancedCalculator: true,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  pro: {
    businessProfiles: 5,
    taxObligations: -1,
    hasReminders: true,
    hasWhatsAppReminders: true,
    hasAdvancedCalculator: true,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: true,
  },
  enterprise: {
    businessProfiles: -1,
    taxObligations: -1,
    hasReminders: true,
    hasWhatsAppReminders: true,
    hasAdvancedCalculator: true,
    hasApiAccess: true,
    hasMultiUserAccess: true,
    hasPrioritySupport: true,
  },
};

class SubscriptionManager {
  private listeners: ((state: SubscriptionState) => void)[] = [];
  private currentState: SubscriptionState | null = null;

  // Subscribe to subscription changes
  subscribe(callback: (state: SubscriptionState) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(state: SubscriptionState) {
    this.currentState = state;
    this.listeners.forEach(listener => listener(state));
  }

  // Get current subscription state
  async getCurrentSubscription(userId: string): Promise<SubscriptionState> {
    try {
      const subscription = await supabaseService.getSubscription(userId);
      const planType = subscription?.plan_type || 'free';
      const status = subscription?.status || 'inactive';
      const isActive = status === 'active';
      
      const state: SubscriptionState = {
        planType,
        status,
        isActive,
        features: PLAN_FEATURES[planType] || PLAN_FEATURES.free
      };

      this.notifyListeners(state);
      return state;
    } catch (error) {
      console.error('Error getting subscription:', error);
      const fallbackState: SubscriptionState = {
        planType: 'free',
        status: 'inactive',
        isActive: false,
        features: PLAN_FEATURES.free
      };
      this.notifyListeners(fallbackState);
      return fallbackState;
    }
  }

  // Handle successful payment - update subscription and notify listeners
  async handlePaymentSuccess(userId: string, planType: string, paymentReference: string) {
    console.log('🎉 Processing payment success:', { userId, planType, paymentReference });
    
    try {
      // Update subscription in database
      const existingSubscription = await supabaseService.getSubscription(userId);
      
      if (existingSubscription) {
        await supabaseService.updateSubscription(userId, {
          plan_type: planType,
          status: 'active',
          paystack_subscription_code: paymentReference,
          next_payment_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });
      } else {
        await supabaseService.createSubscription({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          paystack_subscription_code: paymentReference,
          next_payment_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });
      }

      // Update profile
      await supabaseService.updateProfile(userId, {
        plan: planType,
        subscription_status: 'active'
      });

      // Enforce new plan limits immediately
      await this.enforcePlanLimits(userId, planType);

      // Get updated subscription state and notify listeners
      const newState = await this.getCurrentSubscription(userId);
      
      console.log('✅ Payment processed successfully:', newState);
      return newState;
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      throw error;
    }
  }

  // Enforce plan limits when subscription changes
  async enforcePlanLimits(userId: string, planType: string) {
    const features = PLAN_FEATURES[planType] || PLAN_FEATURES.free;
    
    try {
      // Enforce business profile limits
      if (features.businessProfiles >= 0) {
        const { data: profiles } = await supabase
          .from('company_profiles')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (profiles && profiles.length > features.businessProfiles) {
          const excessProfiles = profiles.slice(features.businessProfiles);
          await supabase
            .from('company_profiles')
            .update({ is_active: false })
            .in('id', excessProfiles.map(p => p.id));
          
          console.log(`🔒 Deactivated ${excessProfiles.length} excess business profiles`);
        }
      }

      // Enforce tax obligation limits
      if (features.taxObligations >= 0) {
        const { data: obligations } = await supabase
          .from('tax_obligations')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (obligations && obligations.length > features.taxObligations) {
          const excessObligations = obligations.slice(features.taxObligations);
          await supabase
            .from('tax_obligations')
            .update({ is_active: false })
            .in('id', excessObligations.map(o => o.id));
          
          console.log(`🔒 Deactivated ${excessObligations.length} excess tax obligations`);
        }
      }

      console.log(`✅ Plan limits enforced for ${planType} plan`);
      
    } catch (error) {
      console.error('❌ Error enforcing plan limits:', error);
    }
  }

  // Check if user can access a specific feature
  canAccessFeature(feature: keyof typeof PLAN_FEATURES.free): boolean {
    if (!this.currentState || !this.currentState.isActive) {
      return PLAN_FEATURES.free[feature] as boolean;
    }
    
    return this.currentState.features[feature] as boolean;
  }

  // Check if user can create more items (profiles, obligations)
  canCreateMore(type: 'businessProfiles' | 'taxObligations', currentCount: number): boolean {
    if (!this.currentState || !this.currentState.isActive) {
      const freeLimit = PLAN_FEATURES.free[type];
      return freeLimit === -1 || currentCount < freeLimit;
    }
    
    const limit = this.currentState.features[type];
    return limit === -1 || currentCount < limit;
  }

  // Get current state without fetching from database
  getCurrentState(): SubscriptionState | null {
    return this.currentState;
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();