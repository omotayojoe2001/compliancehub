# WhatsApp Notifications Setup Guide

## Option 1: Wati.io (Recommended for Quick Start)

### Setup Steps:
1. **Sign up**: Go to wati.io
2. **Connect WhatsApp**: Scan QR code with business WhatsApp
3. **Get API credentials**: Copy API key and base URL
4. **Add to .env**:
   ```
   VITE_WATI_API_KEY=your_api_key_here
   VITE_WATI_BASE_URL=https://live-server-xxxxx.wati.io/api/v1
   ```

### Pricing:
- Starter: $49/month (1,000 messages)
- Growth: $99/month (5,000 messages)
- Pro: $199/month (15,000 messages)

## Option 2: Twilio WhatsApp Business API

### Setup Steps:
1. **Create Twilio account**: twilio.com
2. **Request WhatsApp access**: Submit business details
3. **Wait for approval**: 2-3 business days
4. **Get credentials**: Account SID, Auth Token, WhatsApp number
5. **Add to .env**:
   ```
   VITE_TWILIO_ACCOUNT_SID=your_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_auth_token
   VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

### Pricing:
- $0.005 per message (Nigeria)
- No monthly fees
- Pay per use

## Option 3: WhatsApp Cloud API (Free Tier)

### Setup Steps:
1. **Facebook Business account**: business.facebook.com
2. **Create WhatsApp Business app**: developers.facebook.com
3. **Get phone number**: Free test number provided
4. **Verify business**: Submit documents
5. **Get access token**: From Meta Business

### Pricing:
- Free: 1,000 messages/month
- $0.0042 per message after

## Implementation Priority:

### Phase 1: Quick Launch (Wati.io)
- ✅ Same-day setup
- ✅ No business verification needed
- ✅ Ready-to-use templates

### Phase 2: Scale (Twilio)
- ✅ Lower per-message cost
- ✅ Better reliability
- ✅ Advanced features

### Phase 3: Enterprise (WhatsApp Cloud API)
- ✅ Direct Meta integration
- ✅ Free tier available
- ✅ Full control

## Message Templates for Tax Reminders:

### VAT Reminder:
```
🚨 VAT REMINDER

VAT Return Due: 21st January 2025
Days Left: 3

⚠️ Don't forget to file soon!

💰 Calculate: taxandcompliance.ng/calculator
📄 File: nrs.gov.ng

Reply HELP for assistance

_T&C - Never miss a deadline_
```

### Welcome Message:
```
🎉 Welcome to TaxandCompliance T&C!

Hi [Business Name]! 👋

Your tax reminders are now ACTIVE:
✅ VAT (21st monthly)
✅ PAYE (10th monthly) 
✅ CAC Annual Returns

📱 We'll remind you 7, 3, and 1 day before each deadline.

🔗 Dashboard: taxandcompliance.ng
💬 Questions? Reply to this message

_Never miss a deadline again!_ 🚀
```

## Next Steps:
1. Choose your preferred service
2. Set up account and get credentials
3. Add environment variables
4. Test with your phone number
5. Deploy and monitor delivery rates