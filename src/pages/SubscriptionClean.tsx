import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, CreditCard, Calendar, Star } from 'lucide-react';

export default function SubscriptionClean() {
  const plans = [
    {
      name: 'Basic',
      price: '₦12,000',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        'PAYE Calculator',
        'VAT Calculator',
        'Email Reminders',
        'WhatsApp Alerts',
        'Basic Support'
      ],
      current: true
    },
    {
      name: 'Pro',
      price: '₦30,000',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'All Basic features',
        'Withholding Tax Calculator',
        'CIT Calculator',
        'Expense Management',
        'Daily Expense Recording',
        'Monthly/Annual Reports',
        'Priority Support'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₦50,000',
      period: '/month',
      description: 'For large organizations',
      features: [
        'All Pro features',
        'Capital Gains Calculator',
        'In-house Tax Consultant',
        'Advanced Expense Analytics',
        'Custom Reports',
        'API Access',
        'Dedicated Support'
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">Choose the perfect plan for your business needs</p>
        </div>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Current Plan: Basic</h3>
                <p className="text-sm text-muted-foreground">Next billing: January 25, 2026</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">₦12,000/month</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-6 relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  <div className="text-xs text-muted-foreground mt-1">All-inclusive pricing</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className={`w-full ${plan.current ? 'bg-gray-400' : plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Current Plan</span>
                <span className="font-medium">Basic Plan</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Fee</span>
                <span className="font-medium">₦12,000</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7.5%)</span>
                <span className="font-medium">₦900</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total Amount</span>
                <span>₦12,900</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Cycle</span>
                <span className="font-medium">Monthly</span>
              </div>
              <div className="flex justify-between">
                <span>Next Payment</span>
                <span className="font-medium">January 25, 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-medium">**** 1234</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Tax Calculations</span>
                  <span className="text-sm">45/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Invoices Generated</span>
                  <span className="text-sm">12/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '24%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Reminders Sent</span>
                  <span className="text-sm">28/∞</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Billing History</h3>
          <div className="space-y-3">
            {[
              { date: '2025-12-25', amount: '₦12,900', status: 'Paid', plan: 'Basic Plan' },
              { date: '2025-11-25', amount: '₦12,900', status: 'Paid', plan: 'Basic Plan' },
              { date: '2025-10-25', amount: '₦12,900', status: 'Paid', plan: 'Basic Plan' }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invoice.plan}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{invoice.amount}</span>
                  <span className="text-green-600 text-sm">{invoice.status}</span>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}