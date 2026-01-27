import { supabase } from './supabase';

export interface AccessControlResult {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
}

export interface UserSubscriptionData {
  planType: string;
  status: string;
  isActive: boolean;
  expiresAt?: Date;
  paymentVerified: boolean;
}

export class AccessControlService {
  
  // Verify user's current subscription status with payment verification
  static async verifyUserAccess(userId: string): Promise<UserSubscriptionData> {
    try {
      // Get subscription from database
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !subscription) {
        return {
          planType: 'free',
          status: 'inactive',
          isActive: false,
          paymentVerified: false
        };
      }

      // Verify payment is still valid (not expired)
      const now = new Date();
      const expiresAt = subscription.next_payment_date ? new Date(subscription.next_payment_date) : null;
      const isExpired = expiresAt && expiresAt < now;

      // If expired, downgrade to free
      if (isExpired) {
        await this.downgradeExpiredSubscription(userId);
        return {
          planType: 'free',
          status: 'expired',
          isActive: false,
          paymentVerified: false
        };
      }

      return {
        planType: subscription.plan_type,
        status: subscription.status,
        isActive: true,
        expiresAt: expiresAt || undefined,
        paymentVerified: true
      };

    } catch (error) {
      console.error('Error verifying user access:', error);
      return {
        planType: 'free',
        status: 'error',
        isActive: false,
        paymentVerified: false
      };
    }
  }

  // Check if user can access a specific feature
  static async canAccessFeature(userId: string, feature: string): Promise<AccessControlResult> {
    const userAccess = await this.verifyUserAccess(userId);
    
    if (!userAccess.isActive) {
      return {
        hasAccess: false,
        reason: 'No active subscription',
        upgradeRequired: 'basic'
      };
    }

    const planFeatures = this.getPlanFeatures(userAccess.planType);
    
    switch (feature) {
      case 'reminders':
        return {
          hasAccess: planFeatures.hasReminders,
          reason: planFeatures.hasReminders ? undefined : 'Reminders require Basic plan or higher',
          upgradeRequired: planFeatures.hasReminders ? undefined : 'basic'
        };
      
      case 'whatsapp_reminders':
        return {
          hasAccess: planFeatures.hasWhatsAppReminders,
          reason: planFeatures.hasWhatsAppReminders ? undefined : 'WhatsApp reminders require Pro plan or higher',
          upgradeRequired: planFeatures.hasWhatsAppReminders ? undefined : 'pro'
        };
      
      case 'advanced_calculator':
        return {
          hasAccess: planFeatures.hasAdvancedCalculator,
          reason: planFeatures.hasAdvancedCalculator ? undefined : 'Advanced calculator requires Pro plan or higher',
          upgradeRequired: planFeatures.hasAdvancedCalculator ? undefined : 'pro'
        };
      
      case 'api_access':
        return {
          hasAccess: planFeatures.hasApiAccess,
          reason: planFeatures.hasApiAccess ? undefined : 'API access requires Enterprise plan',
          upgradeRequired: planFeatures.hasApiAccess ? undefined : 'enterprise'
        };
      
      default:
        return { hasAccess: true };
    }
  }

  // Check if user can create more items (profiles, obligations)
  static async canCreateItem(userId: string, itemType: 'business_profiles' | 'tax_obligations'): Promise<AccessControlResult> {
    const userAccess = await this.verifyUserAccess(userId);
    const planFeatures = this.getPlanFeatures(userAccess.planType);
    
    // Get current count
    const tableName = itemType === 'business_profiles' ? 'company_profiles' : 'tax_obligations';
    const { data: items, error } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      return {
        hasAccess: false,
        reason: 'Error checking current items'
      };
    }

    const currentCount = items?.length || 0;
    const limit = itemType === 'business_profiles' ? planFeatures.businessProfiles : planFeatures.taxObligations;
    
    // -1 means unlimited
    if (limit === -1) {
      return { hasAccess: true };
    }

    if (currentCount >= limit) {
      const itemName = itemType === 'business_profiles' ? 'business profiles' : 'tax obligations';
      const requiredPlan = this.getRequiredPlanForLimit(itemType, currentCount + 1);
      
      return {
        hasAccess: false,
        reason: `You've reached the limit of ${limit} ${itemName} for your ${userAccess.planType} plan`,
        upgradeRequired: requiredPlan
      };
    }

    return { hasAccess: true };
  }

  // Enforce access control by deactivating excess items
  static async enforceAccessLimits(userId: string): Promise<void> {
    const userAccess = await this.verifyUserAccess(userId);
    const planFeatures = this.getPlanFeatures(userAccess.planType);

    // Enforce business profile limits
    if (planFeatures.businessProfiles >= 0) {
      await this.enforceItemLimit(userId, 'company_profiles', planFeatures.businessProfiles);
    }

    // Enforce tax obligation limits
    if (planFeatures.taxObligations >= 0) {
      await this.enforceItemLimit(userId, 'tax_obligations', planFeatures.taxObligations);
    }
  }

  // Helper method to enforce item limits
  private static async enforceItemLimit(userId: string, tableName: string, limit: number): Promise<void> {
    const { data: items } = await supabase
      .from(tableName)
      .select('id, created_at, is_primary')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (items && items.length > limit) {
      const excessItems = items.slice(limit);
      await supabase
        .from(tableName)
        .update({ is_active: false })
        .in('id', excessItems.map(item => item.id));
      
      console.log(`Deactivated ${excessItems.length} excess items from ${tableName}`);
    }
  }

  // Downgrade expired subscription
  private static async downgradeExpiredSubscription(userId: string): Promise<void> {
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', userId);

    // Enforce free plan limits
    await this.enforceItemLimit(userId, 'company_profiles', 0);
    await this.enforceItemLimit(userId, 'tax_obligations', 0);
  }

  // Get plan features
  private static getPlanFeatures(planType: string) {
    const features = {
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
        hasAdvancedCalculator: false,
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

    return features[planType] || features.free;
  }

  // Get required plan for a specific limit
  private static getRequiredPlanForLimit(itemType: string, requiredCount: number): string {
    if (itemType === 'business_profiles') {
      if (requiredCount <= 1) return 'basic';
      if (requiredCount <= 5) return 'pro';
      return 'enterprise';
    } else if (itemType === 'tax_obligations') {
      if (requiredCount <= 3) return 'basic';
      return 'pro';
    }
    return 'basic';
  }

  // Real-time subscription monitoring
  static async startSubscriptionMonitoring(userId: string, callback: (access: UserSubscriptionData) => void): Promise<() => void> {
    const channel = supabase
      .channel(`subscription_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          const access = await this.verifyUserAccess(userId);
          callback(access);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}