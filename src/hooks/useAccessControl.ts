import { useEffect, useState, useCallback } from 'react';
import { AccessControlService, AccessControlResult, UserSubscriptionData } from '@/lib/accessControlService';
import { useAuth } from '@/contexts/AuthContextClean';

export function useAccessControl() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verify and update subscription data
  const refreshAccess = useCallback(async () => {
    if (!user) {
      setSubscriptionData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const access = await AccessControlService.verifyUserAccess(user.id);
      setSubscriptionData(access);
      
      // Enforce limits if subscription is active
      if (access.isActive) {
        await AccessControlService.enforceAccessLimits(user.id);
      }
      
    } catch (err) {
      console.error('Error refreshing access:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify access');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize and set up real-time monitoring
  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;

    const initializeAccess = async () => {
      await refreshAccess();
      
      // Set up real-time subscription monitoring
      unsubscribe = await AccessControlService.startSubscriptionMonitoring(
        user.id,
        (access) => {
          console.log('🔄 Subscription updated:', access);
          setSubscriptionData(access);
        }
      );
    };

    initializeAccess();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, refreshAccess]);

  // Check if user can access a feature
  const canAccessFeature = useCallback(async (feature: string): Promise<AccessControlResult> => {
    if (!user) {
      return {
        hasAccess: false,
        reason: 'User not authenticated',
        upgradeRequired: 'basic'
      };
    }

    return await AccessControlService.canAccessFeature(user.id, feature);
  }, [user]);

  // Check if user can create more items
  const canCreateItem = useCallback(async (itemType: 'business_profiles' | 'tax_obligations'): Promise<AccessControlResult> => {
    if (!user) {
      return {
        hasAccess: false,
        reason: 'User not authenticated'
      };
    }

    return await AccessControlService.canCreateItem(user.id, itemType);
  }, [user]);

  // Synchronous feature check (uses cached data)
  const hasFeatureAccess = useCallback((feature: string): boolean => {
    if (!subscriptionData || !subscriptionData.isActive) {
      return false;
    }

    const planFeatures = getPlanFeatures(subscriptionData.planType);
    
    switch (feature) {
      case 'reminders':
        return planFeatures.hasReminders;
      case 'whatsapp_reminders':
        return planFeatures.hasWhatsAppReminders;
      case 'advanced_calculator':
        return planFeatures.hasAdvancedCalculator;
      case 'api_access':
        return planFeatures.hasApiAccess;
      case 'multi_user_access':
        return planFeatures.hasMultiUserAccess;
      case 'priority_support':
        return planFeatures.hasPrioritySupport;
      default:
        return false;
    }
  }, [subscriptionData]);

  // Get item limits
  const getItemLimit = useCallback((itemType: 'business_profiles' | 'tax_obligations'): number => {
    if (!subscriptionData) return 0;
    
    const planFeatures = getPlanFeatures(subscriptionData.planType);
    return itemType === 'business_profiles' ? planFeatures.businessProfiles : planFeatures.taxObligations;
  }, [subscriptionData]);

  // Check if subscription is about to expire
  const isExpiringSoon = useCallback((): boolean => {
    if (!subscriptionData?.expiresAt) return false;
    
    const now = new Date();
    const expiresAt = new Date(subscriptionData.expiresAt);
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7; // Expires within 7 days
  }, [subscriptionData]);

  return {
    // Subscription data
    subscriptionData,
    loading,
    error,
    
    // Access control methods
    canAccessFeature,
    canCreateItem,
    hasFeatureAccess,
    refreshAccess,
    
    // Convenience getters
    planType: subscriptionData?.planType || 'free',
    isActive: subscriptionData?.isActive || false,
    paymentVerified: subscriptionData?.paymentVerified || false,
    expiresAt: subscriptionData?.expiresAt,
    isExpiringSoon: isExpiringSoon(),
    
    // Limits
    getItemLimit,
    businessProfileLimit: getItemLimit('business_profiles'),
    taxObligationLimit: getItemLimit('tax_obligations'),
  };
}

// Helper function to get plan features
function getPlanFeatures(planType: string) {
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