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
      
      // Set enterprise immediately, then try to fetch real data
      setUserPlan('enterprise');
      setLoading(false);
      
      try {
        console.group('🔍 PLAN RESTRICTIONS DEBUG');
        console.log('Fetching subscription for user:', user.id);
        
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('plan_type')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        console.log('Subscription query result:', { subscription, error });
        
        if (error) {
          console.log('⚠️ No subscription found, defaulting to enterprise:', error.message);
          console.groupEnd();
          // Keep enterprise default
          return;
        }
        
        // Validate plan_type value, default to enterprise
        const rawPlan = subscription?.plan_type;
        const validPlans = ['free', 'basic', 'pro', 'enterprise'];
        const plan = (rawPlan && validPlans.includes(rawPlan.toLowerCase())) 
          ? rawPlan.toLowerCase() 
          : 'enterprise';
        
        console.log('📊 Plan detection:', {
          rawPlanType: subscription?.plan_type,
          detectedPlan: plan,
          isValid: validPlans.includes(plan)
        });
        
        if (plan !== 'enterprise') {
          console.warn('⚠️ NON-ENTERPRISE PLAN DETECTED:', plan);
          console.warn('User should have enterprise access but has:', plan);
        }
        
        console.groupEnd();
        setUserPlan(plan);
      } catch (error) {
        console.error('❌ Failed to fetch subscription plan:', error);
        console.groupEnd();
        // Keep enterprise default
      }
    }
    
    fetchPlan();
  }, [user?.id]);
  
  const effectivePlan = userPlan; // Always use userPlan (defaults to enterprise)
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