# Twilio WhatsApp Setup - IMMEDIATE IMPLEMENTATION

## Step 1: Get Twilio Credentials
1. Go to https://console.twilio.com/
2. Sign up (get $15 free credit)
3. Go to Console Dashboard
4. Copy these values:
   - Account SID
   - Auth Token

## Step 2: WhatsApp Sandbox (Test Immediately)
1. In Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Follow instructions to join sandbox
3. Test number: +1 415 523 8886
4. Send "join [your-sandbox-name]" to activate

## Step 3: Add to .env file
```
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Step 4: WhatsApp Service Implementation

```typescript
// src/lib/twilioWhatsAppService.ts
interface WhatsAppMessage {
  to: string; // Format: whatsapp:+2348012345678
  message: string;
}

class TwilioWhatsAppService {
  private accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  private authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  private fromNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;

  async sendMessage({ to, message }: WhatsAppMessage) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: this.fromNumber,
            To: to,
            Body: message
          })
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Twilio error: ${result.message}`);
      }

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }
  }

  formatPhoneNumber(phone: string): string {
    // Convert +234801234567 to whatsapp:+234801234567
    const cleaned = phone.replace(/[^\d+]/g, '');
    return `whatsapp:${cleaned.startsWith('+') ? cleaned : '+' + cleaned}`;
  }

  async sendTaxReminder(phone: string, taxType: string, dueDate: string, daysLeft: number) {
    const urgencyEmoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    
    const message = `${urgencyEmoji} *TAX REMINDER*

*${taxType.toUpperCase()}* Due: ${dueDate}
Days Left: *${daysLeft}*

${daysLeft <= 1 ? '🔥 *URGENT: File today to avoid penalties!*' : 
  daysLeft <= 3 ? '⚠️ Don\'t forget to file soon!' : 
  '📋 Friendly reminder - deadline approaching'}

💰 Calculate tax: your-calculator-link
📄 File online: firs.gov.ng

Reply *HELP* for assistance

_ComplianceHub - Never miss a deadline_`;

    const formattedPhone = this.formatPhoneNumber(phone);
    return this.sendMessage({ to: formattedPhone, message });
  }

  async sendWelcomeMessage(phone: string, businessName: string) {
    const message = `🎉 *Welcome to ComplianceHub!*

Hi ${businessName}! 👋

Your tax reminders are now *ACTIVE*:
✅ VAT (21st monthly)
✅ PAYE (10th monthly) 
✅ CAC Annual Returns

📱 We'll remind you *7, 3, and 1 day* before each deadline.

🔗 Dashboard: your-app-url.com
💬 Questions? Reply *HELP*

_Never miss a deadline again!_ 🚀`;

    const formattedPhone = this.formatPhoneNumber(phone);
    return this.sendMessage({ to: formattedPhone, message });
  }

  async sendPaymentReminder(phone: string, businessName: string, plan: string, expiryDate: string) {
    const message = `💳 *Subscription Reminder*

Hi ${businessName},

Your *${plan.toUpperCase()}* plan expires on ${expiryDate}.

⚠️ Renew now to keep receiving tax reminders:
• VAT deadlines
• PAYE reminders  
• CAC notifications

💰 Renew: your-payment-link
📱 Dashboard: your-app-url.com

_ComplianceHub Team_`;

    const formattedPhone = this.formatPhoneNumber(phone);
    return this.sendMessage({ to: formattedPhone, message });
  }
}

export const twilioWhatsAppService = new TwilioWhatsAppService();
```

## Step 5: Test Implementation

```typescript
// src/lib/testWhatsApp.ts
import { twilioWhatsAppService } from './twilioWhatsAppService';

export async function testWhatsAppSend() {
  // Test with your own WhatsApp number
  const testPhone = '+2348012345678'; // Replace with your number
  
  const result = await twilioWhatsAppService.sendTaxReminder(
    testPhone,
    'VAT',
    'March 21, 2024',
    3
  );
  
  console.log('WhatsApp test result:', result);
  return result;
}

// Call this function to test
// testWhatsAppSend();
```

## Step 6: Production WhatsApp Number
1. In Twilio Console → Phone Numbers → Manage → WhatsApp senders
2. Request WhatsApp-enabled number
3. Submit business profile for approval (24-48 hours)
4. Update VITE_TWILIO_WHATSAPP_NUMBER in .env

## Step 7: Integration with Your App

```typescript
// Add to src/lib/reminderService.ts
import { twilioWhatsAppService } from './twilioWhatsAppService';

export async function sendAutomatedReminder(userId: string, taxType: string, dueDate: string, daysLeft: number) {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, business_name')
      .eq('id', userId)
      .single();

    if (profile?.phone) {
      // Send WhatsApp reminder
      const result = await twilioWhatsAppService.sendTaxReminder(
        profile.phone,
        taxType,
        dueDate,
        daysLeft
      );

      // Log the reminder
      await supabase.from('reminders').insert({
        user_id: userId,
        tax_type: taxType,
        due_date: dueDate,
        days_before: daysLeft,
        channel: 'whatsapp',
        status: result.success ? 'sent' : 'failed',
        message_id: result.messageId
      });

      console.log(`WhatsApp reminder sent to ${profile.business_name}:`, result);
    }
  } catch (error) {
    console.error('Failed to send WhatsApp reminder:', error);
  }
}
```

## Costs:
- **Sandbox**: FREE for testing
- **Production**: $0.005 per message (₦8 per message)
- **Monthly**: ~₦2,400 for 300 messages

## Next Steps:
1. **Sign up to Twilio** (5 minutes)
2. **Add credentials to .env** (1 minute)  
3. **Test in sandbox** (immediate)
4. **Apply for production number** (submit today, approved in 1-2 days)

Ready to start? Get your Twilio credentials and I'll help you test immediately!