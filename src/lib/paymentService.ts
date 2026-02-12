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
  plan: 'free' | 'basic' | 'pro' | 'enterprise' | 'filing_service';
  businessName?: string;
  filingRequestId?: string;
  metadata?: Record<string, any>;
}

const PLAN_PRICES = {
  free: 0,           // ₦0 - free plan
  basic: 1500000,    // ₦15,000 in kobo
  pro: 5000000,      // ₦50,000 in kobo
  enterprise: 15000000, // ₦150,000 in kobo
  filing_service: 1000000 // ₦10,000 in kobo
};

export const paymentService = {
  async getPlanPrice(plan: 'free' | 'basic' | 'pro' | 'enterprise' | 'filing_service'): Promise<number> {
    // Try to get price from database first
    try {
      const serviceName = plan === 'filing_service' ? 'filing_service' : `subscription_${plan}`;
      console.log('🔍 Fetching price for:', serviceName);
      
      const { data, error } = await supabase
        .from('pricing_config')
        .select('price_kobo')
        .eq('service_name', serviceName)
        .eq('is_active', true)
        .single();
      
      console.log('💰 Database response:', { data, error });
      
      if (data) {
        console.log('✅ Using database price:', data.price_kobo, 'kobo =', data.price_kobo / 100, 'naira');
        return data.price_kobo;
      }
    } catch (error) {
      console.error('❌ Database price fetch error:', error);
    }
    
    // Fallback to hardcoded prices
    console.log('⚠️ Using fallback price for', plan, ':', PLAN_PRICES[plan]);
    return PLAN_PRICES[plan];
  },

  async initializePayment({ email, amount, plan, businessName, filingRequestId, metadata }: PaymentData) {
    return new Promise((resolve, reject) => {
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount,
        currency: 'NGN',
        metadata: {
          plan_type: plan,
          business_name: businessName,
          filing_request_id: filingRequestId,
          ...metadata
        },
        callback: (response: any) => {
          console.log('💳 Payment successful:', response);
          
          // Handle filing service payment differently
          if (plan === 'filing_service' && filingRequestId) {
            (async () => {
              try {
                // Import filing service dynamically to avoid circular dependency
                const { filingService } = await import('./filingService');
                await filingService.updateFilingRequestPayment(filingRequestId, response.reference);
                
                alert('🎉 Filing service payment successful! Your request has been submitted to our team.');
                window.location.reload();
              } catch (error) {
                console.error('💳 Filing payment processing error:', error);
                alert('❌ Error processing filing payment. Please contact support.');
              }
            })();
          } else {
            // Handle subscription payments
            console.log('💳 Plan being saved:', plan);
            console.log('💳 Amount paid:', amount);
            
            (async () => {
              try {
                const { data: user } = await supabase.auth.getUser();
                console.log('💳 Current user:', user.user?.id);
                
                if (user.user) {
                  const newState = await subscriptionManager.handlePaymentSuccess(
                    user.user.id,
                    plan as 'free' | 'basic' | 'pro' | 'enterprise',
                    response.reference
                  );
                  
                  console.log('✅ SUBSCRIPTION UPDATED SUCCESSFULLY!');
                  console.log('✅ New plan:', newState.planType);
                  console.log('✅ Status:', newState.status);
                  console.log('✅ Features unlocked:', newState.features);
                  
                  const featureList = [];
                  if (newState.features.hasReminders) featureList.push('Email Reminders');
                  if (newState.features.hasWhatsAppReminders) featureList.push('WhatsApp Reminders');
                  if (newState.features.hasAdvancedCalculator) featureList.push('Advanced Calculator');
                  if (newState.features.businessProfiles > 0) featureList.push(`${newState.features.businessProfiles} Business Profile${newState.features.businessProfiles > 1 ? 's' : ''}`);
                  
                  alert(`🎉 SUCCESS! You are now on the ${plan.toUpperCase()} plan!\n\nFeatures unlocked:\n• ${featureList.join('\n• ')}\n\nYour dashboard will refresh automatically.`);
                  
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }
              } catch (error) {
                console.error('💳 Payment processing error:', error);
                alert('❌ Error processing payment. Please contact support.');
              }
            })();
          }
          
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

  formatPrice(kobo: number): string {
    return `₦${(kobo / 100).toLocaleString()}`;
  }
};