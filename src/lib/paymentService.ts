import { supabase } from './supabase';
import { supabaseService } from './supabaseService';
import { subscriptionVerificationService } from './subscriptionVerificationService';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaymentData {
  email: string;
  amount: number; // in kobo
  plan: 'test200' | 'basic' | 'pro' | 'enterprise';
  businessName?: string;
}

const PLAN_PRICES = {
  test200: 20000,    // ₦200 in kobo
  basic: 1500000,    // ₦15,000 in kobo
  pro: 5000000,      // ₦50,000 in kobo
  enterprise: 15000000 // ₦150,000 in kobo
};

export const paymentService = {
  async initializePayment({ email, amount, plan, businessName }: PaymentData) {
    return new Promise((resolve, reject) => {
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount,
        currency: 'NGN',
        metadata: {
          plan_type: plan,
          business_name: businessName
        },
        callback: (response: any) => {
          console.log('💳 Payment successful:', response);
          console.log('💳 Plan being saved:', plan);
          console.log('💳 Amount paid:', amount);
          
          // Handle async operations after resolving
          (async () => {
            try {
              // Get current user
              const { data: user } = await supabase.auth.getUser();
              console.log('💳 Current user:', user.user?.id);
              
              if (user.user) {
                // Check if user already has a subscription
                const existingSubscription = await supabaseService.getSubscription(user.user.id);
                console.log('💳 Existing subscription:', existingSubscription);

                if (existingSubscription) {
                  // Update existing subscription
                  await supabaseService.updateSubscription(user.user.id, {
                    plan_type: plan,
                    status: 'active',
                    paystack_subscription_code: response.reference,
                    amount: amount,
                    next_payment_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                  });
                  console.log('💳 Subscription updated successfully');
                } else {
                  // Create new subscription
                  await supabaseService.createSubscription({
                    user_id: user.user.id,
                    plan_type: plan,
                    status: 'active',
                    paystack_subscription_code: response.reference,
                    amount: amount,
                    next_payment_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                  });
                  console.log('💳 Subscription saved successfully');
                }
                
                // Update profile with correct plan
                console.log('💳 Updating profile with plan:', plan);
                await supabaseService.updateProfile(user.user.id, {
                  plan: plan,
                  subscription_status: 'active'
                });
                console.log('💳 Profile updated successfully with plan:', plan);
                
                // VERIFY SUBSCRIPTION UPDATE
                console.log('🔍 Starting subscription verification...');
                const verification = await subscriptionVerificationService.verifySubscriptionUpdate(
                  user.user.id, 
                  plan, 
                  response.reference
                );
                
                if (verification.success) {
                  console.log('✅ SUBSCRIPTION VERIFIED SUCCESSFULLY!');
                  console.log('✅ Plan in database:', verification.profile?.plan);
                  console.log('✅ Status in database:', verification.profile?.subscription_status);
                  alert(`✅ SUCCESS! You are now subscribed to ${plan.toUpperCase()} plan. Your reminders are active!`);
                } else {
                  console.error('❌ SUBSCRIPTION VERIFICATION FAILED:', verification.error);
                  alert(`⚠️ Payment successful but verification failed: ${verification.error}. Please contact support.`);
                }
              }
            } catch (error) {
              console.error('💳 Payment processing error:', error);
              alert('❌ Error processing payment. Please contact support.');
            }
          })();
          
          resolve(response);
        },
        onClose: () => {
          console.log('💳 Payment cancelled');
          reject(new Error('Payment cancelled'));
        }
      });

      handler.openIframe();
    });
  },

  getPlanPrice(plan: 'test200' | 'basic' | 'pro' | 'enterprise'): number {
    return PLAN_PRICES[plan];
  },

  formatPrice(kobo: number): string {
    return `₦${(kobo / 100).toLocaleString()}`;
  }
};