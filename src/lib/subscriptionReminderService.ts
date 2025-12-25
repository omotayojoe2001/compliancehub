import { supabase } from './supabase';
import { emailService } from './emailService';

interface SubscriptionReminder {
  user_id: string;
  email: string;
  business_name: string;
  plan_type: string;
  next_payment_date: string;
  days_until_expiry: number;
}

export const subscriptionReminderService = {
  async checkAndSendExpirationReminders() {
    try {
      console.log('🔔 Checking subscription expiration reminders...');
      
      // Get all active subscriptions with user details
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          user_id,
          plan_type,
          next_payment_date,
          status
        `)
        .eq('status', 'active')
        .not('next_payment_date', 'is', null);

      if (error) {
        console.error('❌ Error fetching subscriptions:', error);
        return;
      }

      if (!subscriptions?.length) {
        console.log('📭 No active subscriptions found');
        return;
      }

      // Get user profiles separately
      const userIds = subscriptions.map(sub => sub.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, business_name')
        .in('id', userIds);

      const today = new Date();
      const remindersToSend: SubscriptionReminder[] = [];

      // Check each subscription for reminder triggers
      for (const sub of subscriptions) {
        const profile = profiles?.find(p => p.id === sub.user_id);
        if (!profile) continue;
        
        const expiryDate = new Date(sub.next_payment_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminders at 7, 3, 1 days before and on expiry day
        if ([7, 3, 1, 0].includes(daysUntilExpiry)) {
          remindersToSend.push({
            user_id: sub.user_id,
            email: profile.email,
            business_name: profile.business_name || 'Your Business',
            plan_type: sub.plan_type,
            next_payment_date: sub.next_payment_date,
            days_until_expiry: daysUntilExpiry
          });
        }

        // Handle expired subscriptions (downgrade to free)
        if (daysUntilExpiry < 0) {
          await this.handleExpiredSubscription(sub.user_id);
        }
      }

      // Send reminder emails
      for (const reminder of remindersToSend) {
        await this.sendExpirationReminder(reminder);
      }

      console.log(`✅ Processed ${remindersToSend.length} subscription reminders`);
      
    } catch (error) {
      console.error('❌ Subscription reminder check failed:', error);
    }
  },

  async sendExpirationReminder(reminder: SubscriptionReminder) {
    try {
      const { days_until_expiry, email, business_name, plan_type } = reminder;
      
      let subject = '';
      let content = '';
      
      if (days_until_expiry === 7) {
        subject = '⏰ Your ComplianceHub subscription expires in 7 days';
        content = `
          <h2>Hi ${business_name}!</h2>
          <p>Your <strong>${plan_type.toUpperCase()}</strong> plan expires in 7 days.</p>
          <p>Don't miss your tax deadlines! Renew now to continue receiving:</p>
          <ul>
            <li>✅ Automated tax deadline reminders</li>
            <li>✅ Compliance guides and calculators</li>
            <li>✅ Peace of mind for your business</li>
          </ul>
          <p><a href="https://compliancehub.ng/subscription" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Now</a></p>
        `;
      } else if (days_until_expiry === 3) {
        subject = '🚨 URGENT: Your subscription expires in 3 days';
        content = `
          <h2>Hi ${business_name}!</h2>
          <p><strong>URGENT:</strong> Your ${plan_type.toUpperCase()} plan expires in just 3 days!</p>
          <p>After expiry, you'll lose access to:</p>
          <ul>
            <li>❌ Tax deadline reminders</li>
            <li>❌ Compliance guides</li>
            <li>❌ Tax calculators</li>
          </ul>
          <p><strong>Don't risk missing tax deadlines and facing penalties!</strong></p>
          <p><a href="https://compliancehub.ng/subscription" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renew Immediately</a></p>
        `;
      } else if (days_until_expiry === 1) {
        subject = '⚠️ FINAL NOTICE: Subscription expires tomorrow';
        content = `
          <h2>Hi ${business_name}!</h2>
          <p><strong>FINAL NOTICE:</strong> Your ${plan_type.toUpperCase()} plan expires TOMORROW!</p>
          <p>This is your last chance to renew before losing access to all compliance reminders.</p>
          <p>Missing tax deadlines can cost you thousands in penalties!</p>
          <p><a href="https://compliancehub.ng/subscription" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">RENEW NOW - Last Chance!</a></p>
        `;
      } else if (days_until_expiry === 0) {
        subject = '❌ Your ComplianceHub subscription has expired';
        content = `
          <h2>Hi ${business_name}!</h2>
          <p>Your ${plan_type.toUpperCase()} subscription has expired today.</p>
          <p>You now have limited access to ComplianceHub features.</p>
          <p>Reactivate now to restore full access and continue protecting your business from tax penalties.</p>
          <p><a href="https://compliancehub.ng/subscription" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reactivate Account</a></p>
        `;
      }

      await emailService.sendEmail({
        to: email,
        subject,
        html: content
      });

      console.log(`📧 Sent ${days_until_expiry}-day expiry reminder to ${email}`);
      
    } catch (error) {
      console.error('❌ Failed to send expiration reminder:', error);
    }
  },

  async handleExpiredSubscription(userId: string) {
    try {
      // Update subscription status to expired
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', userId);

      // Downgrade profile to free plan
      await supabase
        .from('profiles')
        .update({ 
          plan: 'free',
          subscription_status: 'expired'
        })
        .eq('id', userId);

      console.log(`⬇️ Downgraded expired subscription for user: ${userId}`);
      
    } catch (error) {
      console.error('❌ Failed to handle expired subscription:', error);
    }
  }
};