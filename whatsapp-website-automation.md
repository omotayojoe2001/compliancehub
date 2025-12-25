# WhatsApp Automation - Same as Email System

## How Your Email System Works:
1. **Website timer** checks for deadlines
2. **Calls Supabase Edge Function** 
3. **Edge Function calls Resend API**
4. **Email sent automatically**

## How WhatsApp Will Work (SAME PATTERN):
1. **Website timer** checks for deadlines  
2. **Calls Supabase Edge Function**
3. **Edge Function calls WhatsApp API**
4. **WhatsApp sent automatically**

## Step 1: Create WhatsApp Edge Function

```typescript
// supabase/functions/send-whatsapp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, message, type = 'reminder' } = await req.json()

    // WhatsApp Business API call
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('WHATSAPP_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace(/[^\d]/g, ''),
          type: 'text',
          text: {
            body: message
          }
        })
      }
    )

    const result = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      throw new Error(`WhatsApp API error: ${result.error?.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.messages[0].id,
        type: type
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

## Step 2: Update Your Website WhatsApp Service

```typescript
// src/lib/whatsappService.ts (Updated to use Edge Function)
class WhatsAppService {
  private supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  async sendMessage(phone: string, message: string, type: string = 'reminder') {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/send-whatsapp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone,
            message: message,
            type: type
          })
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`WhatsApp service error: ${result.error}`);
      }

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTaxReminder(phone: string, taxType: string, dueDate: string, daysLeft: number) {
    const urgencyEmoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    
    const message = `${urgencyEmoji} *TAX REMINDER*

*${taxType.toUpperCase()}* Due: ${dueDate}
Days Left: *${daysLeft}*

${daysLeft <= 1 ? '🔥 *URGENT: File today to avoid penalties!*' : 
  daysLeft <= 3 ? '⚠️ Don\'t forget to file soon!' : 
  '📋 Friendly reminder - deadline approaching'}

💰 Calculate tax: compliancehub.ng/calculator
📄 File online: firs.gov.ng

_ComplianceHub - Never miss a deadline_`;

    return this.sendMessage(phone, message, 'tax_reminder');
  }

  async sendWelcomeMessage(phone: string, businessName: string) {
    const message = `🎉 *Welcome to ComplianceHub!*

Hi ${businessName}! 👋

Your tax reminders are now *ACTIVE*:
✅ VAT (21st monthly)
✅ PAYE (10th monthly) 
✅ CAC Annual Returns

📱 We'll remind you *7, 3, and 1 day* before each deadline.

🔗 Dashboard: compliancehub.ng
💬 Questions? Reply to this message

_Never miss a deadline again!_ 🚀`;

    return this.sendMessage(phone, message, 'welcome');
  }
}

export const whatsappService = new WhatsAppService();
```

## Step 3: Update Your Existing Reminder Service

```typescript
// Update src/lib/reminderService.ts
import { whatsappService } from './whatsappService';
import { emailService } from './emailService'; // Your existing email service

export async function sendTaxReminder(
  userId: string, 
  taxType: string, 
  dueDate: string, 
  daysLeft: number
) {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, business_name, email')
      .eq('id', userId)
      .single();

    if (profile) {
      // Send BOTH email AND WhatsApp (parallel)
      const [emailResult, whatsappResult] = await Promise.all([
        // Your existing email reminder
        emailService.sendTaxReminder(profile.email, profile.business_name, taxType, dueDate, daysLeft),
        
        // New WhatsApp reminder
        profile.phone ? whatsappService.sendTaxReminder(profile.phone, taxType, dueDate, daysLeft) : null
      ]);

      console.log(`Reminders sent to ${profile.business_name}:`, {
        email: emailResult?.success,
        whatsapp: whatsappResult?.success
      });
    }
  } catch (error) {
    console.error('Failed to send reminders:', error);
  }
}
```

## Step 4: Add WhatsApp Environment Variables to Supabase

In Supabase Dashboard → Settings → Edge Functions → Environment Variables:
```
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

## Result: SAME AUTOMATION AS EMAILS

✅ **Website triggers** both email AND WhatsApp
✅ **Same timing** (7, 3, 1 days before)
✅ **Same automation service** runs both
✅ **Messages from YOUR business** (not Twilio)
✅ **No external dependencies**

## Timeline:
1. **Apply for WhatsApp Business API** (business.facebook.com)
2. **Deploy Edge Function** (5 minutes)
3. **Update reminder service** (5 minutes)
4. **Test automation** (immediate)

**This gives you WhatsApp automation EXACTLY like your email system - triggered from your website, not from Twilio!**

Ready to set this up?