import { supabase } from './supabase';
import { supabaseService } from './supabaseService';
import { subscriptionVerificationService } from './subscriptionVerificationService';
import { subscriptionManager } from './subscriptionManager';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaymentData {
  email: string;
  amount: number; // in kobo
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  businessName?: string;
}

const PLAN_PRICES = {
  free: 0,           // ₦0 - free plan
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
                // Use subscription manager to handle payment success
                const newState = await subscriptionManager.handlePaymentSuccess(
                  user.user.id,
                  plan,
                  response.reference
                );
                
                console.log('✅ SUBSCRIPTION UPDATED SUCCESSFULLY!');
                console.log('✅ New plan:', newState.planType);
                console.log('✅ Status:', newState.status);
                console.log('✅ Features unlocked:', newState.features);
                
                // Show success message with feature details
                const featureList = [];
                if (newState.features.hasReminders) featureList.push('Email Reminders');
                if (newState.features.hasWhatsAppReminders) featureList.push('WhatsApp Reminders');
                if (newState.features.hasAdvancedCalculator) featureList.push('Advanced Calculator');
                if (newState.features.businessProfiles > 0) featureList.push(`${newState.features.businessProfiles} Business Profile${newState.features.businessProfiles > 1 ? 's' : ''}`);
                
                alert(`🎉 SUCCESS! You are now on the ${plan.toUpperCase()} plan!\n\nFeatures unlocked:\n• ${featureList.join('\n• ')}\n\nYour dashboard will refresh automatically.`);
                
                // Force page refresh to update UI
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
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

  getPlanPrice(plan: 'free' | 'basic' | 'pro' | 'enterprise'): number {
    return PLAN_PRICES[plan];
  },

  formatPrice(kobo: number): string {
    return `₦${(kobo / 100).toLocaleString()}`;
  }
};