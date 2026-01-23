import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Bell, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Crown,
  Lock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';

export default function FreemiumDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      const userProfile = await supabaseService.getProfile(user.id);
      setProfile(userProfile);
      
      // Check if user has active subscription
      try {
        const subscription = await supabaseService.getSubscription(user.id);
        setHasSubscription(subscription?.status === 'active');
      } catch (subError) {
        console.warn('Could not load subscription:', subError);
        setHasSubscription(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set defaults if loading fails
      setProfile(null);
      setHasSubscription(false);
    }
  };

  const features = [
    {
      icon: Calculator,
      title: 'Smart Tax Calculators',
      description: 'VAT, PAYE, CIT, Withholding Tax calculators',
      status: 'premium',
      route: '/calculator'
    },
    {
      icon: Bell,
      title: 'Automated Reminders',
      description: 'Email & WhatsApp notifications for deadlines',
      status: 'premium',
      route: '/reminders'
    },
    {
      icon: FileText,
      title: 'Digital Cashbook',
      description: 'Track income, expenses with VAT calculations',
      status: 'premium',
      route: '/cashbook'
    },
    {
      icon: TrendingUp,
      title: 'Tax Obligations',
      description: 'Manage all your tax filing requirements',
      status: 'premium',
      route: '/obligations'
    }
  ];

  const handleUpgrade = () => {
    window.location.href = '/subscription';
  };

  if (hasSubscription) {
    // User has subscription - redirect to normal dashboard
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to ComplianceHub, {profile?.business_name || 'there'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            You're one step away from automated Nigerian tax compliance
          </p>
          
          {/* Upgrade CTA */}
          <Card className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-6">
            <div className="flex items-center justify-center gap-4">
              <Crown className="h-8 w-8" />
              <div className="text-left">
                <h3 className="text-xl font-bold">Unlock All Features</h3>
                <p className="text-blue-100">Start your tax compliance journey today</p>
              </div>
              <Button 
                onClick={handleUpgrade}
                className="bg-white text-blue-600 hover:bg-gray-100"
                size="lg"
              >
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 relative overflow-hidden">
              {/* Lock Overlay */}
              <div className="absolute top-4 right-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Lock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  
                  {/* Preview Content */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 opacity-60">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleUpgrade}
                    variant="outline" 
                    className="w-full"
                  >
                    Upgrade to Access
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pricing Preview */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-center mb-6">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Basic', price: '₦12,000', features: ['Tax Calculators', 'Email Reminders', 'Basic Support'] },
              { name: 'Pro', price: '₦30,000', features: ['All Basic', 'WhatsApp Alerts', 'Digital Cashbook', 'Priority Support'], popular: true },
              { name: 'Enterprise', price: '₦50,000', features: ['All Pro', 'Tax Consultant', 'API Access', 'Dedicated Support'] }
            ].map((plan, index) => (
              <Card key={index} className={`p-4 text-center ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block">
                    Most Popular
                  </div>
                )}
                <h4 className="font-bold text-lg">{plan.name}</h4>
                <div className="text-2xl font-bold text-blue-600 my-2">{plan.price}</div>
                <div className="text-sm text-muted-foreground mb-4">/month</div>
                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleUpgrade}
                  className={plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Choose Plan
                </Button>
              </Card>
            ))}
          </div>
        </Card>

        {/* Stats Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tax Calculations', value: '0', icon: Calculator },
            { label: 'Reminders Sent', value: '0', icon: Bell },
            { label: 'Obligations Tracked', value: '0', icon: FileText },
            { label: 'Days Saved', value: '0', icon: TrendingUp }
          ].map((stat, index) => (
            <Card key={index} className="p-4 text-center relative">
              <div className="absolute top-2 right-2">
                <Lock className="h-3 w-3 text-orange-500" />
              </div>
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold text-muted-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}