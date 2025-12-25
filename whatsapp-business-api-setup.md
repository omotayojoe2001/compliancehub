# WhatsApp Business API - Direct from YOUR Business

## How It Works:
Your website → WhatsApp Business API → Customer's WhatsApp
Messages show as "ComplianceHub" (your business name)

## Setup Steps:

### Step 1: Get WhatsApp Business API Access
1. **Go to**: https://business.facebook.com/
2. **Create Business Manager** account
3. **Add WhatsApp Business API**
4. **Verify your business** (1-2 days)

### Step 2: Get Your Credentials
After approval, you'll get:
- Phone Number ID
- Access Token
- Business Account ID

### Step 3: Update Environment Variables
```
# Replace Twilio with WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### Step 4: WhatsApp Business Service
```typescript
// src/lib/whatsappBusinessService.ts
class WhatsAppBusinessService {
  private phoneNumberId = import.meta.env.WHATSAPP_PHONE_NUMBER_ID;
  private accessToken = import.meta.env.WHATSAPP_ACCESS_TOKEN;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  async sendMessage(to: string, message: string) {
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
            to: to.replace(/[^\d]/g, ''), // Clean phone number
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

Reply for assistance

_ComplianceHub - Never miss a deadline_`;

    return this.sendMessage(phone, message);
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

    return this.sendMessage(phone, message);
  }
}

export const whatsappBusinessService = new WhatsAppBusinessService();
```

### Step 5: Automated Reminders from Your Website
```typescript
// src/lib/automatedWhatsAppReminders.ts
import { whatsappBusinessService } from './whatsappBusinessService';
import { supabase } from './supabase';

export async function sendAutomatedTaxReminders() {
  console.log('🤖 Running automated WhatsApp reminders...');

  // Get all users with upcoming tax deadlines
  const { data: obligations } = await supabase
    .from('tax_obligations')
    .select(`
      *,
      profiles!inner(phone, business_name)
    `)
    .gte('due_date', new Date().toISOString())
    .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  for (const obligation of obligations || []) {
    const daysLeft = Math.ceil(
      (new Date(obligation.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Send reminder at 7, 3, and 1 days before
    if ([7, 3, 1].includes(daysLeft)) {
      const result = await whatsappBusinessService.sendTaxReminder(
        obligation.profiles.phone,
        obligation.tax_type,
        new Date(obligation.due_date).toLocaleDateString(),
        daysLeft
      );

      console.log(`WhatsApp reminder sent to ${obligation.profiles.business_name}:`, result);
    }
  }
}

// Run every hour
setInterval(sendAutomatedTaxReminders, 60 * 60 * 1000);
```

## Benefits of WhatsApp Business API:
✅ **Messages from YOUR business name** (ComplianceHub)
✅ **Fully automated** from your website
✅ **No "via Twilio"** branding
✅ **Professional appearance**
✅ **Free tier available** (1000 messages/month)
✅ **Can message any Nigerian number**

## Timeline:
- **Day 1**: Apply for WhatsApp Business API
- **Day 2-3**: Business verification
- **Day 4**: Start sending automated messages as "ComplianceHub"

## Cost:
- **Free tier**: 1000 messages/month
- **Paid**: $0.005 per message after free tier

This is exactly what you want - automated WhatsApp messages directly from your ComplianceHub business account, not through Twilio!

Ready to apply for WhatsApp Business API?