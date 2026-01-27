import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Crown, Check, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: keyof ReturnType<typeof useSubscription>['features'];
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function SubscriptionGate({ 
  children, 
  feature, 
  fallback,
  showUpgradePrompt = true 
}: SubscriptionGateProps) {
  const { canAccessFeature, planType, loading } = useSubscription();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Checking access...</span>
      </div>
    );
  }

  // Check if user can access the feature
  const hasAccess = canAccessFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt by default
  if (showUpgradePrompt) {
    return (
      <Card className="p-6 text-center border-2 border-dashed border-gray-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Premium Feature
            </h3>
            <p className="text-sm text-gray-600">
              This feature requires a {getRequiredPlan(feature)} plan or higher.
              You're currently on the <span className="font-medium capitalize">{planType}</span> plan.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button asChild variant="default">
              <Link to="/subscription">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/subscription">
                View Plans
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Return nothing if no upgrade prompt
  return null;
}

// Helper function to determine required plan for a feature
function getRequiredPlan(feature: string): string {
  const featurePlanMap: Record<string, string> = {
    hasReminders: 'Basic',
    hasWhatsAppReminders: 'Pro',
    hasAdvancedCalculator: 'Pro',
    hasApiAccess: 'Enterprise',
    hasMultiUserAccess: 'Enterprise',
    hasPrioritySupport: 'Pro'
  };
  
  return featurePlanMap[feature] || 'Basic';
}