import { supabase } from './supabase';

interface EmailData {
  to: string;
  businessName?: string;
}

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
      headers: {
        Authorization: `Bearer ${supabase.supabaseKey}`
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
};

export const emailService = {
  // Welcome email - sent immediately after signup
  async sendWelcomeEmail({ to, businessName }: EmailData) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #2563eb; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ComplianceHub!</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your tax compliance assistant is ready</p>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Hi ${businessName || 'there'}! 👋</h2>
          
          <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining ComplianceHub! We're excited to help you never miss another tax deadline.
          </p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0;">What happens next?</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Complete your business profile</li>
              <li style="margin-bottom: 8px;">We'll start tracking your tax deadlines</li>
              <li style="margin-bottom: 8px;">Get WhatsApp & email reminders before deadlines</li>
              <li>Access our tax calculator anytime</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Complete Your Setup
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
            Need help? Reply to this email or contact us at kolajo@forecourtlimited.com
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            ComplianceHub - Never miss a tax deadline again
          </p>
        </div>
      </div>
    `;
    
    return await sendEmail(to, '🎉 Welcome to ComplianceHub!', html);
  },

  // Follow-up email - sent 30 minutes after signup
  async sendFollowUpEmail({ to, businessName }: EmailData) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #f59e0b; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Don't forget to complete your setup!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${businessName || 'there'},
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
            We noticed you haven't completed your business profile yet. It only takes 2 minutes!
          </p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: 600;">
              ⚠️ Without completing your profile, we can't send you important deadline reminders!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/dashboard" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Complete Setup Now (2 mins)
            </a>
          </div>
        </div>
      </div>
    `;
    
    return await sendEmail(to, '⏰ Quick reminder: Complete your ComplianceHub setup', html);
  },

  // Educational email - sent 2 hours after signup
  async sendEducationalEmail({ to, businessName }: EmailData) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #059669; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px;">📚 Tax Compliance Made Simple</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">Everything you need to know about Nigerian business taxes</p>
        </div>
        
        <div style="padding: 40px 20px;">
          <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0;">
            Hi ${businessName || 'there'},
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0;">
            Nigerian tax compliance doesn't have to be scary. Here's what ComplianceHub helps you track:
          </p>
          
          <div style="margin: 30px 0;">
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
              <h3 style="color: #065f46; margin: 0 0 10px 0;">🧾 VAT (Value Added Tax)</h3>
              <p style="color: #374151; margin: 0; font-size: 14px;">Monthly filing required. We remind you before the 21st of each month.</p>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">👥 PAYE (Pay As You Earn)</h3>
              <p style="color: #374151; margin: 0; font-size: 14px;">Monthly remittance for employee taxes. Due by 10th of following month.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/dashboard" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Start Tracking Your Deadlines
            </a>
          </div>
        </div>
      </div>
    `;
    
    return await sendEmail(to, '📚 Nigerian Tax Compliance Made Simple', html);
  },

  // Reminder email for tax deadlines
  async sendReminderEmail({ to, businessName, obligationType, daysUntilDue, dueDate }: {
    to: string;
    businessName?: string;
    obligationType: string;
    daysUntilDue: number;
    dueDate: string;
  }) {
    const urgencyColor = daysUntilDue <= 1 ? '#dc2626' : daysUntilDue <= 3 ? '#ea580c' : '#2563eb';
    const urgencyText = daysUntilDue <= 1 ? '🚨 URGENT' : daysUntilDue <= 3 ? '⚠️ Important' : '📅 Reminder';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: ${urgencyColor}; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${urgencyText}: ${obligationType} Filing Due</h1>
          <p style="color: #f1f5f9; margin: 10px 0 0 0; font-size: 18px;">${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'} remaining</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${businessName || 'there'},
          </p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
            <p style="color: #991b1b; margin: 0; font-weight: 600;">
              ${daysUntilDue <= 1 ? '🚨 File TODAY to avoid penalties!' : '⚠️ File soon to avoid penalties!'}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/dashboard" 
               style="background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `;
    
    return await sendEmail(to, `${urgencyText}: ${obligationType} Due in ${daysUntilDue} Day${daysUntilDue === 1 ? '' : 's'}`, html);
  }
};