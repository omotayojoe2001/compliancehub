import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabase } from '@/lib/supabase';
import { planRestrictionsService } from '@/lib/planRestrictionsService';

export function usePlanRestrictions() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<string>('free'); // Default to free
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) {
        setUserPlan('free');
        setLoading(false);
        return;
      }
      
      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_type, plan')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Use plan_type first, then plan, default to free
        const plan = subscription?.plan_type || subscription?.plan || 'free';
        setUserPlan(plan);
      } catch (error) {
        console.error('Failed to fetch subscription plan:', error);
        // Default to free for proper restrictions
        setUserPlan('free');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlan();
  }, [user?.id]);
  
  const effectivePlan = loading ? 'free' : userPlan;
  const planLimits = planRestrictionsService.getPlanLimits(effectivePlan);
  
  return {
    plan: effectivePlan,
    limits: planLimits,
    loading,
    canCreateCompanyProfile: (currentCount: number) => 
      planRestrictionsService.canCreateCompanyProfile(effectivePlan, currentCount),
    canCreateObligation: (currentCount: number) => 
      planRestrictionsService.canCreateObligation(effectivePlan, currentCount),
    canAccessFeature: (feature: keyof typeof planLimits) => 
      planRestrictionsService.canAccessFeature(effectivePlan, feature),
    getUpgradeMessage: (feature: keyof typeof planLimits) => 
      planRestrictionsService.getUpgradeMessage(effectivePlan, feature),
    getCompanyProfileLimitMessage: () => 
      planRestrictionsService.getCompanyProfileLimitMessage(effectivePlan),
    getObligationLimitMessage: () => 
      planRestrictionsService.getObligationLimitMessage(effectivePlan),
  };
}