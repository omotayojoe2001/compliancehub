import { useEffect, useState } from 'react';
import { subscriptionManager, SubscriptionState } from '@/lib/subscriptionManager';
import { useAuth } from '@/contexts/AuthContextClean';

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscriptionState(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const initializeSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to subscription changes
        unsubscribe = subscriptionManager.subscribe((state: SubscriptionState) => {
          console.log('🔄 Subscription state updated:', state);
          setSubscriptionState(state);
          setLoading(false);
        });

        // Get initial subscription state
        await subscriptionManager.getCurrentSubscription(user.id);

      } catch (err) {
        console.error('❌ Error initializing subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
        setLoading(false);
      }
    };

    initializeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // Helper functions
  const canAccessFeature = (feature: keyof SubscriptionState['features']) => {
    if (!subscriptionState) return false;
    return subscriptionState.features[feature] as boolean;
  };

  const canCreateMore = (type: 'businessProfiles' | 'taxObligations', currentCount: number) => {
    if (!subscriptionState) return false;
    return subscriptionManager.canCreateMore(type, currentCount);
  };

  const getFeatureLimit = (type: 'businessProfiles' | 'taxObligations') => {
    if (!subscriptionState) return 0;
    return subscriptionState.features[type];
  };

  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await subscriptionManager.getCurrentSubscription(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh subscription');
    }
  };

  return {
    subscriptionState,
    loading,
    error,
    canAccessFeature,
    canCreateMore,
    getFeatureLimit,
    refreshSubscription,
    // Convenience getters
    planType: subscriptionState?.planType || 'free',
    isActive: subscriptionState?.isActive || false,
    features: subscriptionState?.features || {
      businessProfiles: 0,
      taxObligations: 0,
      hasReminders: false,
      hasWhatsAppReminders: false,
      hasAdvancedCalculator: false,
      hasApiAccess: false,
      hasMultiUserAccess: false,
      hasPrioritySupport: false,
    }
  };
}