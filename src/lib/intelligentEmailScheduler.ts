import { supabase } from './supabase';
import { emailService } from './emailService';

class IntelligentEmailScheduler {
  // Schedule follow-up email only if profile is incomplete
  async scheduleFollowUpEmail(userId: string, userEmail: string, businessName: string) {
    setTimeout(async () => {
      try {
        // Check if profile is still incomplete after 30 minutes
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, phone')
          .eq('id', userId)
          .single();
        
        // Only send if profile is incomplete
        if (!profile || !profile.business_name || !profile.phone) {
          console.log('📧 Sending follow-up email - profile incomplete');
          await emailService.sendFollowUpEmail({
            to: userEmail,
            businessName: businessName || 'there'
          });
        } else {
          console.log('📧 Skipping follow-up email - profile already complete');
        }
      } catch (error) {
        console.error('📧 Follow-up email check failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Schedule educational email (always send)
  async scheduleEducationalEmail(userEmail: string, businessName: string) {
    setTimeout(async () => {
      try {
        console.log('📧 Sending educational email');
        await emailService.sendEducationalEmail({
          to: userEmail,
          businessName: businessName || 'there'
        });
      } catch (error) {
        console.error('📧 Educational email failed:', error);
      }
    }, 2 * 60 * 60 * 1000); // 2 hours
  }

  // Check profile completion status
  async isProfileComplete(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, phone')
        .eq('id', userId)
        .single();
      
      return !!(profile?.business_name && profile?.phone);
    } catch (error) {
      console.error('Profile completion check failed:', error);
      return false;
    }
  }

  // Send welcome email and schedule intelligent follow-ups
  async handleNewUserEmails(userId: string, userEmail: string, businessName: string) {
    try {
      // Always send welcome email immediately
      console.log('📧 Sending welcome email');
      await emailService.sendWelcomeEmail({
        to: userEmail,
        businessName: businessName || 'there'
      });

      // Schedule intelligent follow-up (only if profile incomplete)
      this.scheduleFollowUpEmail(userId, userEmail, businessName);

      // Schedule educational email (always send)
      this.scheduleEducationalEmail(userEmail, businessName);

    } catch (error) {
      console.error('📧 New user email sequence failed:', error);
    }
  }
}

export const intelligentEmailScheduler = new IntelligentEmailScheduler();