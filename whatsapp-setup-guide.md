# WhatsApp Business API Setup Guide

## Step 1: Get WhatsApp Business API Access

### Option A: Meta Business (Free Tier)
1. Go to https://business.facebook.com/
2. Create Business Manager account
3. Add WhatsApp Business API
4. Get Phone Number ID and Access Token

### Option B: Twilio WhatsApp (Paid)
1. Go to https://console.twilio.com/
2. Create account
3. Enable WhatsApp Business API
4. Get Account SID and Auth Token

## Step 2: Environment Variables
Add to your .env file:

```
# WhatsApp Business API (Meta)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# OR Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

## Step 3: WhatsApp Service Implementation

```typescript
// src/lib/whatsappService.ts
interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., "2348012345678")
  message: string;
  type?: 'text' | 'template';
}

class WhatsAppService {
  private phoneNumberId = import.meta.env.WHATSAPP_PHONE_NUMBER_ID;
  private accessToken = import.meta.env.WHATSAPP_ACCESS_TOKEN;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  async sendMessage({ to, message, type = 'text' }: WhatsAppMessage) {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
              body: message
            }
          })
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${result.error?.message}`);
      }

      return { success: true, messageId: result.messages[0].id };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTaxReminder(to: string, taxType: string, dueDate: string, daysLeft: number) {
    const urgencyEmoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    
    const message = `${urgencyEmoji} TAX REMINDER

${taxType.toUpperCase()} Due: ${dueDate}
Days Left: ${daysLeft}

${daysLeft <= 1 ? 'URGENT: File today to avoid penalties!' : 
  daysLeft <= 3 ? 'Don\'t forget to file soon!' : 
  'Friendly reminder - deadline approaching'}

Need help? Reply HELP
Calculate tax: bit.ly/your-calculator

- ComplianceHub`;

    return this.sendMessage({ to, message });
  }

  async sendWelcomeMessage(to: string, businessName: string) {
    const message = `🎉 Welcome to ComplianceHub, ${businessName}!

Your tax reminders are now active:
✅ VAT (21st monthly)
✅ PAYE (10th monthly) 
✅ CAC Annual Returns

We'll remind you 7, 3, and 1 day before each deadline.

Questions? Reply HELP
Dashboard: your-app-url.com

Never miss a deadline again! 🚀`;

    return this.sendMessage({ to, message });
  }
}

export const whatsappService = new WhatsAppService();
```

## Step 4: Integration with Your Reminder System

```typescript
// Update src/lib/reminderService.ts
import { whatsappService } from './whatsappService';

// Add to your existing reminder function
export async function sendTaxReminder(
  userId: string, 
  taxType: string, 
  dueDate: string, 
  daysLeft: number
) {
  // Get user profile with phone number
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone, business_name')
    .eq('id', userId)
    .single();

  if (profile?.phone) {
    // Send WhatsApp reminder
    await whatsappService.sendTaxReminder(
      profile.phone, 
      taxType, 
      dueDate, 
      daysLeft
    );
    
    console.log(`WhatsApp reminder sent to ${profile.business_name}`);
  }
}
```

## Step 5: Webhook for Replies (Optional)

```typescript
// src/api/whatsapp-webhook.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  // Verify webhook (Meta requirement)
  const mode = new URL(request.url).searchParams.get('hub.mode');
  const token = new URL(request.url).searchParams.get('hub.verify_token');
  const challenge = new URL(request.url).searchParams.get('hub.challenge');
  
  if (mode === 'subscribe' && token === 'your_verify_token') {
    return new Response(challenge);
  }

  // Handle incoming messages
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const message = body.entry[0].changes[0].value.messages[0];
    const from = message.from;
    const text = message.text?.body?.toLowerCase();

    // Auto-reply to common queries
    if (text === 'help') {
      await whatsappService.sendMessage({
        to: from,
        message: `ComplianceHub Help:

COMMANDS:
• HELP - Show this menu
• STATUS - Check your reminders
• CALC - Tax calculator link
• STOP - Pause reminders

Support: your-email@domain.com
Dashboard: your-app-url.com`
      });
    }
  }

  return new Response('OK');
}
```

## Quick Start (Easiest Option)

### Use WhatsApp Business App + Broadcast Lists
1. Download WhatsApp Business app
2. Set up business profile
3. Create broadcast lists for customers
4. Send manual reminders using templates

### Message Templates:
```
🚨 VAT REMINDER
Due: March 21st (3 days)
Calculate: [your-calculator-link]
File: [FIRS-portal-link]
Questions? Reply here.
```

## Cost Comparison:
- **WhatsApp Business App**: Free (manual)
- **Meta Business API**: Free tier (1000 messages/month)
- **Twilio WhatsApp**: $0.005 per message
- **Third-party services**: $20-50/month

## Next Steps:
1. Choose your option (recommend Meta Business API)
2. Set up business verification
3. Add phone numbers to your profiles table
4. Test with a few customers first

Which option do you want to implement first?