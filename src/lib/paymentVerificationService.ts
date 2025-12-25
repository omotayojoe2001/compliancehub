import { supabase } from './supabase';

const PAYSTACK_SECRET_KEY = "PAYSTACK_SECRET_KEY_PLACEHOLDER";

export const paymentVerificationService = {
  async verifyPayment(reference: string) {
    try {
      console.log('🔍 Verifying payment:', reference);
      
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.status && result.data.status === 'success') {
        console.log('✅ Payment verified successfully');
        
        // Update user subscription based on verified payment
        await this.updateSubscriptionFromPayment(result.data);
        
        return { success: true, data: result.data };
      } else {
        console.log('❌ Payment verification failed');
        return { success: false, error: 'Payment not successful' };
      }
    } catch (error) {
      console.error('🔍 Payment verification error:', error);
      return { success: false, error };
    }
  },

  async updateSubscriptionFromPayment(paymentData: any) {
    try {
      const { reference, amount, customer, metadata } = paymentData;
      
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, business_name')
        .eq('email', customer.email)
        .single();

      if (profileError || !profile) {
        console.error('❌ User not found:', customer.email);
        return;
      }

      const planType = metadata?.plan_type || this.getPlanFromAmount(amount);
      
      // Update or create subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (existingSubscription) {
        await supabase
          .from('subscriptions')
          .update({
            plan_type: planType,
            status: 'active',
            paystack_subscription_code: reference,
            amount: amount,
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
          .eq('user_id', profile.id);
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: profile.id,
            plan_type: planType,
            status: 'active',
            paystack_subscription_code: reference,
            amount: amount,
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          plan: planType,
          subscription_status: 'active'
        })
        .eq('id', profile.id);

      console.log('✅ Subscription updated from payment verification');
    } catch (error) {
      console.error('❌ Error updating subscription:', error);
    }
  },

  getPlanFromAmount(amount: number): string {
    switch (amount) {
      case 10000: return 'test100';
      case 20000: return 'test200';
      case 300000: return 'basic';
      case 700000: return 'pro';
      case 3000000: return 'annual';
      default: return 'basic';
    }
  },

  async checkUserPaymentStatus(userEmail: string) {
    try {
      console.log('🔍 Checking payment status for:', userEmail);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        return null;
      }

      // Try to get subscription with better error handling
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile?.id)
        .maybeSingle(); // Use maybeSingle instead of single

      if (subscriptionError) {
        console.error('❌ Subscription error:', subscriptionError);
        // Continue even if subscription table has issues
      }

      return {
        profile: profile,
        subscription: subscription,
        hasActiveSubscription: subscription?.status === 'active'
      };
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      return null;
    }
  }
};