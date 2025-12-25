import { freshDbService } from './freshDbService';

export const subscriptionVerificationService = {
  // Verify subscription was properly updated in database
  async verifySubscriptionUpdate(userId: string, expectedPlan: string, paymentReference: string) {
    console.log('🔍 Verifying subscription update...');
    console.log('👤 User ID:', userId);
    console.log('📋 Expected Plan:', expectedPlan);
    console.log('💳 Payment Reference:', paymentReference);
    
    try {
      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check profile table
      const profile = await freshDbService.getProfile(userId);
      console.log('👤 Profile after payment:', profile);
      
      if (!profile) {
        console.error('❌ Profile not found');
        return { success: false, error: 'Profile not found' };
      }
      
      // Check if plan was updated
      if (profile.plan !== expectedPlan) {
        console.error('❌ Plan not updated in profile');
        console.error('Expected:', expectedPlan, 'Got:', profile.plan);
        return { success: false, error: 'Plan not updated in profile' };
      }
      
      // Check subscription status
      if (profile.subscription_status !== 'active') {
        console.error('❌ Subscription status not active');
        console.error('Status:', profile.subscription_status);
        return { success: false, error: 'Subscription status not active' };
      }
      
      // Check subscriptions table
      const subscription = await this.getSubscriptionRecord(userId);
      console.log('💳 Subscription record:', subscription);
      
      if (!subscription) {
        console.error('❌ Subscription record not found');
        return { success: false, error: 'Subscription record not found' };
      }
      
      // Verify subscription details
      if (subscription.plan_type !== expectedPlan) {
        console.error('❌ Plan type mismatch in subscriptions table');
        console.error('Expected:', expectedPlan, 'Got:', subscription.plan_type);
        return { success: false, error: 'Plan type mismatch in subscriptions table' };
      }
      
      if (subscription.status !== 'active') {
        console.error('❌ Subscription not active in subscriptions table');
        console.error('Status:', subscription.status);
        return { success: false, error: 'Subscription not active' };
      }
      
      console.log('✅ Subscription verification successful!');
      return {
        success: true,
        profile,
        subscription,
        message: 'Subscription updated successfully'
      };
      
    } catch (error) {
      console.error('❌ Subscription verification failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get subscription record from database
  async getSubscriptionRecord(userId: string) {
    try {
      const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/subscriptions?user_id=eq.${userId}`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('❌ Error fetching subscription record:', error);
      return null;
    }
  },
  
  // Test subscription flow end-to-end
  async testSubscriptionFlow(userEmail: string, planType: string) {
    console.log('🧪 Testing subscription flow...');
    console.log('📧 Email:', userEmail);
    console.log('📋 Plan:', planType);
    
    try {
      // Get user profile first
      const response = await fetch(`https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/profiles?email=eq.${userEmail}`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json'
        }
      });
      
      const profiles = await response.json();
      const profile = profiles[0];
      
      if (!profile) {
        console.error('❌ User profile not found');
        return { success: false, error: 'User profile not found' };
      }
      
      console.log('👤 Found profile:', profile.business_name);
      console.log('📋 Current plan:', profile.plan);
      console.log('🔄 Current status:', profile.subscription_status);
      
      // Simulate payment verification
      const mockPaymentReference = `test_${Date.now()}`;
      
      // Verify subscription update
      const verification = await this.verifySubscriptionUpdate(profile.id, planType, mockPaymentReference);
      
      return verification;
      
    } catch (error) {
      console.error('❌ Subscription flow test failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Manual database check for debugging
  async debugSubscriptionState(userId: string) {
    console.log('🔧 Debug: Checking subscription state...');
    
    try {
      // Check profile
      const profile = await freshDbService.getProfile(userId);
      console.log('👤 Profile:', {
        id: profile?.id,
        business_name: profile?.business_name,
        plan: profile?.plan,
        subscription_status: profile?.subscription_status
      });
      
      // Check subscriptions table
      const subscription = await this.getSubscriptionRecord(userId);
      console.log('💳 Subscription:', {
        id: subscription?.id,
        plan_type: subscription?.plan_type,
        status: subscription?.status,
        amount: subscription?.amount,
        created_at: subscription?.created_at
      });
      
      return { profile, subscription };
      
    } catch (error) {
      console.error('❌ Debug failed:', error);
      return { error: error.message };
    }
  }
};