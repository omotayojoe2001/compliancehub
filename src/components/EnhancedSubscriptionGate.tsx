import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Crown, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useAccessControl } from '@/hooks/useAccessControl';

interface EnhancedSubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
  itemType?: 'business_profiles' | 'tax_obligations';
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  strictMode?: boolean; // If true, blocks access even during loading
}

export function EnhancedSubscriptionGate({ 
  children, 
  feature,
  itemType,
  fallback,
  showUpgradePrompt = true,
  strictMode = false
}: EnhancedSubscriptionGateProps) {
  const { 
    subscriptionData, 
    loading, 
    error, 
    canAccessFeature, 
    canCreateItem, 
    hasFeatureAccess,
    isExpiringSoon,
    paymentVerified 
  } = useAccessControl();
  
  const [accessResult, setAccessResult] = useState<{hasAccess: boolean, reason?: string, upgradeRequired?: string} | null>(null);
  const [checking, setChecking] = useState(false);

  // Check access when component mounts or dependencies change
  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      
      setChecking(true);
      
      try {
        let result;
        
        if (feature) {
          // Check feature access
          result = await canAccessFeature(feature);
        } else if (itemType) {
          // Check item creation access
          result = await canCreateItem(itemType);
        } else {
          // Default: check if subscription is active and payment verified
          result = {
            hasAccess: subscriptionData?.isActive && paymentVerified,
            reason: !subscriptionData?.isActive ? 'No active subscription' : 
                   !paymentVerified ? 'Payment not verified' : undefined,
            upgradeRequired: 'basic'
          };
        }
        
        setAccessResult(result);
      } catch (err) {
        console.error('Error checking access:', err);
        setAccessResult({
          hasAccess: false,
          reason: 'Error verifying access',
          upgradeRequired: 'basic'
        });
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [feature, itemType, subscriptionData, loading, canAccessFeature, canCreateItem, paymentVerified]);

  // Show loading state
  if (loading || checking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">
          {strictMode ? 'Verifying access...' : 'Checking subscription...'}
        </span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-6 text-center border-2 border-red-300 bg-red-50">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-900">Access Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // Check if payment verification failed
  if (!paymentVerified && subscriptionData?.planType !== 'free') {
    return (
      <Card className="p-6 text-center border-2 border-yellow-300 bg-yellow-50">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-yellow-900">Payment Verification Required</h3>
            <p className="text-sm text-yellow-700">
              Your subscription requires payment verification. Please contact support or update your payment method.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="default">
              <Link to="/subscription">Update Payment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/settings">Contact Support</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Show expiration warning
  if (isExpiringSoon && subscriptionData?.isActive) {
    return (
      <Card className="p-6 text-center border-2 border-orange-300 bg-orange-50">
        <div className="flex flex-col items-center space-y-4">
          <Clock className="h-8 w-8 text-orange-600" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-orange-900">Subscription Expiring Soon</h3>
            <p className="text-sm text-orange-700">
              Your subscription expires on {subscriptionData.expiresAt?.toLocaleDateString()}. 
              Renew now to continue accessing premium features.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="default">
              <Link to="/subscription">Renew Now</Link>
            </Button>
            <Button 
              onClick={() => setAccessResult({hasAccess: true})} 
              variant="outline"
            >
              Continue for Now
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Check access result
  if (accessResult && accessResult.hasAccess) {
    return (
      <div>
        {/* Show verification badge for paid features */}
        {subscriptionData?.isActive && paymentVerified && (
          <div className="mb-2 flex items-center text-xs text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified {subscriptionData.planType} subscriber
          </div>
        )}
        {children}
      </div>
    );
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt by default
  if (showUpgradePrompt) {
    const requiredPlan = accessResult?.upgradeRequired || 'basic';
    const reason = accessResult?.reason || 'This feature requires a paid subscription';
    
    return (
      <Card className="p-6 text-center border-2 border-dashed border-gray-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {subscriptionData?.planType === 'free' ? 'Premium Feature' : 'Upgrade Required'}
            </h3>
            <p className="text-sm text-gray-600">{reason}</p>
            <p className="text-xs text-gray-500">
              Current plan: <span className="font-medium capitalize">{subscriptionData?.planType || 'free'}</span>
              {subscriptionData?.isActive ? ' (Active)' : ' (Inactive)'}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button asChild variant="default">
              <Link to="/subscription">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/subscription">View All Plans</Link>
            </Button>
          </div>
          
          {/* Show what they get with upgrade */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left w-full max-w-sm">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan Includes:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {getPlanBenefits(requiredPlan).map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    );
  }

  // Return nothing if no upgrade prompt
  return null;
}

// Helper function to get plan benefits
function getPlanBenefits(planType: string): string[] {
  const benefits = {
    basic: [
      '1 Business Profile',
      '3 Tax Obligations',
      'Email Reminders',
      'Basic Calculator'
    ],
    pro: [
      '5 Business Profiles',
      'Unlimited Tax Obligations',
      'WhatsApp Reminders',
      'Advanced Calculator',
      'Priority Support'
    ],
    enterprise: [
      'Unlimited Business Profiles',
      'Unlimited Tax Obligations',
      'API Access',
      'Multi-user Access',
      'Dedicated Support'
    ]
  };

  return benefits[planType] || benefits.basic;
}