import { useEffect, useState } from 'react';
import { PlanEnforcementService } from '@/lib/planEnforcementService';
import { useAuth } from '@/contexts/AuthContextClean';

export function usePlanEnforcement() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initializePlanEnforcement();
    }
  }, [user]);

  const initializePlanEnforcement = async () => {
    try {
      setLoading(true);
      
      // Fix any subscription inconsistencies
      await PlanEnforcementService.fixSubscriptionInconsistency();
      
      // Get current plan
      const plan = await PlanEnforcementService.getCurrentUserPlan();
      setCurrentPlan(plan);
      
      // Enforce plan limits
      await PlanEnforcementService.enforcePlanLimits();
      
    } catch (error) {
      console.error('Error enforcing plan limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = () => {
    return PlanEnforcementService.getPlanLimits(currentPlan);
  };

  const canCreateBusinessProfile = (currentCount: number) => {
    return PlanEnforcementService.canCreateBusinessProfile(currentPlan, currentCount);
  };

  const canCreateTaxObligation = (currentCount: number) => {
    return PlanEnforcementService.canCreateTaxObligation(currentPlan, currentCount);
  };

  return {
    currentPlan,
    loading,
    getPlanLimits,
    canCreateBusinessProfile,
    canCreateTaxObligation,
    refreshPlan: initializePlanEnforcement
  };
}