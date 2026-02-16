import { supabase } from './supabase';

export const emailService = {
  sendEmail: async (data: { to: string; subject: string; body: string }) => {
    try {
      console.log('📧 Sending email to:', data.to);
      console.log('📧 Subject:', data.subject);
      
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: { to: data.to, subject: data.subject, body: data.body }
      });
      
      if (error) {
        console.error('❌ Email send failed:', error);
        return { success: false, error };
      }
      
      console.log('✅ Email sent successfully:', result);
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error };
    }
  },
  
  sendWelcomeEmail: async (data: { to: string; businessName: string }) => {
    return emailService.sendEmail({
      to: data.to,
      subject: 'Welcome to TaxandCompliance T&C!',
      body: `Hi ${data.businessName},\n\nWelcome to TaxandCompliance T&C! We're excited to help you manage your tax compliance.\n\nGet started now by logging into your dashboard!`
    });
  },
  
  sendReminderEmail: async (data: any) => ({ success: true, error: null }),
  sendFollowUpEmail: async (data: any) => ({ success: true, error: null }),
  sendEducationalEmail: async (data: any) => ({ success: true, error: null })
};
