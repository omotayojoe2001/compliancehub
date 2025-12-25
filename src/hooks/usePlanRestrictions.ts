import { useProfile } from './useProfile';
import { planRestrictionsService } from '@/lib/planRestrictionsService';

export function usePlanRestrictions() {
  const { profile, loading } = useProfile();
  const userPlan = profile?.plan || 'basic'; // Default to basic instead of free
  
  // If profile is still loading, use basic plan defaults
  const effectivePlan = loading ? 'basic' : userPlan;
  
  const planLimits = planRestrictionsService.getPlanLimits(effectivePlan);
  
  return {
    plan: effectivePlan,
    limits: planLimits,
    canCreateObligation: (currentCount: number) => 
      planRestrictionsService.canCreateObligation(effectivePlan, currentCount),
    canAccessFeature: (feature: keyof typeof planLimits) => 
      planRestrictionsService.canAccessFeature(effectivePlan, feature),
    getUpgradeMessage: (feature: keyof typeof planLimits) => 
      planRestrictionsService.getUpgradeMessage(effectivePlan, feature),
    getObligationLimitMessage: () => 
      planRestrictionsService.getObligationLimitMessage(effectivePlan),
  };
}