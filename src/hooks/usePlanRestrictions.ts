import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabase } from '@/lib/supabase';
import { planRestrictionsService } from '@/lib/planRestrictionsService';

export function usePlanRestrictions() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<string>('enterprise'); // Default to enterprise for full access
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) {
        setUserPlan('enterprise'); // Default to enterprise
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
        
        // Use plan_type first, then plan, default to enterprise
        const plan = subscription?.plan_type || subscription?.plan || 'enterprise';
        setUserPlan(plan);
      } catch (error) {
        console.error('Failed to fetch subscription plan:', error);
        // Default to enterprise for full access
        setUserPlan('enterprise');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlan();
  }, [user?.id]);
  
  const effectivePlan = loading ? 'enterprise' : userPlan;
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