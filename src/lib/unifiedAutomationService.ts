import { supabase } from './supabase';
import { emailService } from './emailService';
import { whatsappService } from './whatsappService';

interface AutomationContext {
  business_name?: string;
  due_date?: string;
  tax_period?: string;
  amount?: number;
  invoice_number?: string;
  client_name?: string;
  [key: string]: any;
}

export const unifiedAutomationService = {
  // Replace template variables with actual values
  replaceVariables(template: string, context: AutomationContext): string {
    let result = template;
    Object.keys(context).forEach(key => {
      const value = context[key];
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
    });
    return result;
  },

  // Send automation based on type and context
  async sendAutomation(
    automationType: string,
    userId: string,
    context: AutomationContext,
    daysBeforeDue?: number
  ): Promise<void> {
    // Get template from database
    let query = supabase
      .from('automation_templates')
      .select('*')
      .eq('automation_type', automationType)
      .eq('is_active', true);

    if (daysBeforeDue !== undefined) {
      query = query.eq('days_before_due', daysBeforeDue);
    } else {
      query = query.is('days_before_due', null);
    }

    const { data: templates } = await query;

    if (!templates || templates.length === 0) {
      console.log(`No active template found for ${automationType}`);
      return;
    }

    const template = templates[0];

    // Get user profile for email and phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, phone, business_name')
      .eq('id', userId)
      .single();

    if (!profile) {
      console.error('User profile not found');
      return;
    }

    // Merge context with profile data
    const fullContext = {
      ...context,
      business_name: context.business_name || profile.business_name || 'there'
    };

    // Send via email if enabled
    if (template.send_via_email && template.email_subject && template.email_body) {
      const subject = this.replaceVariables(template.email_subject, fullContext);
      const body = this.replaceVariables(template.email_body, fullContext);

      await emailService.sendEmail({
        to: profile.email,
        subject,
        body
      });

      console.log(`📧 Email sent: ${template.name}`);
    }

    // Send via WhatsApp if enabled
    if (template.send_via_whatsapp && template.whatsapp_message && profile.phone) {
      const message = this.replaceVariables(template.whatsapp_message, fullContext);

      await whatsappService.sendMessage(profile.phone, message);

      console.log(`📱 WhatsApp sent: ${template.name}`);
    }
  },

  // Signup automations
  async handleSignup(userId: string, userEmail: string, businessName: string): Promise<void> {
    const context = { business_name: businessName };

    // Send welcome immediately
    await this.sendAutomation('welcome', userId, context);

    // Schedule follow-up (check profile completion first)
    const { data: template } = await supabase
      .from('automation_templates')
      .select('delay_minutes')
      .eq('automation_type', 'followup')
      .eq('is_active', true)
      .single();

    if (template) {
      setTimeout(async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, phone')
          .eq('id', userId)
          .single();

        if (!profile || !profile.business_name || !profile.phone) {
          await this.sendAutomation('followup', userId, context);
        }
      }, (template.delay_minutes || 30) * 60 * 1000);
    }

    // Schedule educational email
    const { data: eduTemplate } = await supabase
      .from('automation_templates')
      .select('delay_minutes')
      .eq('automation_type', 'educational')
      .eq('is_active', true)
      .single();

    if (eduTemplate) {
      setTimeout(async () => {
        await this.sendAutomation('educational', userId, context);
      }, (eduTemplate.delay_minutes || 120) * 60 * 1000);
    }
  },

  // Login notification
  async handleLogin(userId: string): Promise<void> {
    await this.sendAutomation('login_notification', userId, {});
  },

  // Tax reminder
  async sendTaxReminder(
    userId: string,
    obligationType: string,
    dueDate: string,
    taxPeriod: string,
    daysBeforeDue: number
  ): Promise<void> {
    await this.sendAutomation('tax_reminder', userId, {
      obligation_type: obligationType,
      due_date: dueDate,
      tax_period: taxPeriod
    }, daysBeforeDue);
  },

  // Invoice notification
  async sendInvoiceNotification(
    userId: string,
    invoiceNumber: string,
    clientName: string,
    amount: number,
    dueDate: string,
    clientPhone?: string
  ): Promise<void> {
    const context = {
      invoice_number: invoiceNumber,
      client_name: clientName,
      amount: amount,
      due_date: dueDate
    };

    // If client phone provided, send directly to client
    if (clientPhone) {
      const { data: template } = await supabase
        .from('automation_templates')
        .select('whatsapp_message')
        .eq('automation_type', 'invoice_notification')
        .eq('is_active', true)
        .single();

      if (template?.whatsapp_message) {
        const message = this.replaceVariables(template.whatsapp_message, context);
        await whatsappService.sendMessage(clientPhone, message);
        console.log(`📱 Invoice notification sent to client`);
      }
    } else {
      // Send to user
      await this.sendAutomation('invoice_notification', userId, context);
    }
  },

  // Payment reminder
  async sendPaymentReminder(
    userId: string,
    invoiceNumber: string,
    clientName: string,
    amount: number,
    dueDate: string,
    daysBeforeDue: number,
    clientEmail?: string,
    clientPhone?: string
  ): Promise<void> {
    const context = {
      invoice_number: invoiceNumber,
      client_name: clientName,
      amount: amount,
      due_date: dueDate
    };

    // Get template
    const { data: template } = await supabase
      .from('automation_templates')
      .select('*')
      .eq('automation_type', 'payment_reminder')
      .eq('days_before_due', daysBeforeDue)
      .eq('is_active', true)
      .single();

    if (!template) return;

    // Get user's business name
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('id', userId)
      .single();

    const fullContext = {
      ...context,
      business_name: profile?.business_name || 'TaxandCompliance T&C'
    };

    // Send to client if contact info provided
    if (clientEmail && template.send_via_email && template.email_subject && template.email_body) {
      const subject = this.replaceVariables(template.email_subject, fullContext);
      const body = this.replaceVariables(template.email_body, fullContext);

      await emailService.sendEmail({
        to: clientEmail,
        subject,
        body
      });

      console.log(`📧 Payment reminder email sent to client`);
    }

    if (clientPhone && template.send_via_whatsapp && template.whatsapp_message) {
      const message = this.replaceVariables(template.whatsapp_message, fullContext);
      await whatsappService.sendMessage(clientPhone, message);

      console.log(`📱 Payment reminder WhatsApp sent to client`);
    }
  }
};
