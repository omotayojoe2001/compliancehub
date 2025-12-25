import { supabase } from './supabase';
import { subscriptionVerificationService } from './subscriptionVerificationService';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaymentData {
  email: string;
  amount: number; // in kobo
  plan: 'test100' | 'test200' | 'basic' | 'pro' | 'annual';
  businessName?: string;
}

const PLAN_PRICES = {
  test100: 10000,  // ₦100 in kobo
  test200: 20000,  // ₦200 in kobo
  basic: 300000,   // ₦3,000 in kobo
  pro: 700000,     // ₦7,000 in kobo
  annual: 3000000  // ₦30,000 in kobo
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
              // Save subscription to database
              const { data: user } = await supabase.auth.getUser();
              console.log('💳 Current user:', user.user?.id);
              
              if (user.user) {
                // Check if user already has a subscription
                const { data: existingSubscription } = await supabase
                  .from('subscriptions')
                  .select('*')
                  .eq('user_id', user.user.id)
                  .maybeSingle();

                console.log('💳 Existing subscription:', existingSubscription);

                if (existingSubscription) {
                  // Update existing subscription
                  const { error } = await supabase
                    .from('subscriptions')
                    .update({
                      plan_type: plan,
                      status: 'active',
                      paystack_subscription_code: response.reference,
                      amount: amount,
                      next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    })
                    .eq('user_id', user.user.id);

                  if (error) {
                    console.error('💳 Subscription update failed:', error);
                  } else {
                    console.log('💳 Subscription updated successfully');
                  }
                } else {
                  // Create new subscription
                  const { error } = await supabase
                    .from('subscriptions')
                    .insert({
                      user_id: user.user.id,
                      plan_type: plan,
                      status: 'active',
                      paystack_subscription_code: response.reference,
                      amount: amount,
                      next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    });

                  if (error) {
                    console.error('💳 Subscription save failed:', error);
                  } else {
                    console.log('💳 Subscription saved successfully');
                  }
                }
                
                // CRITICAL: Update profile with CORRECT plan
                console.log('💳 Updating profile with plan:', plan);
                const { error: profileError } = await supabase
                  .from('profiles')
                  .update({
                    plan: plan, // Use the actual plan from payment
                    subscription_status: 'active'
                  })
                  .eq('id', user.user.id);

                if (profileError) {
                  console.error('💳 Profile update failed:', profileError);
                } else {
                  console.log('💳 Profile updated successfully with plan:', plan);
                }
                
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

  getPlanPrice(plan: 'test100' | 'test200' | 'basic' | 'pro' | 'annual'): number {
    return PLAN_PRICES[plan];
  },

  formatPrice(kobo: number): string {
    return `₦${(kobo / 100).toLocaleString()}`;
  }
};