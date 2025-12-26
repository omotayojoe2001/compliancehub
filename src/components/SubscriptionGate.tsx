import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Crown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { freshDbService } from '@/lib/freshDbService';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
}

export function SubscriptionGate({ children, feature }: SubscriptionGateProps) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const profile = await freshDbService.getProfile(user.id);
        // Check if user has active subscription (not free)
        const hasActiveSubscription = profile?.subscription_status === 'active' && 
                                    profile?.plan !== 'free';
        setHasAccess(hasActiveSubscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Login Required</h3>
          <p className="text-muted-foreground mb-6">
            Please login to access the {feature}.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upgrade Required</h3>
          <p className="text-muted-foreground mb-6">
            The {feature} is available to paid subscribers only.
          </p>
          
          <div className="text-left mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>Advanced tax calculations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>WhatsApp reminders</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>Unlimited tax obligations</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/subscription">
              <Button>Upgrade Now</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}