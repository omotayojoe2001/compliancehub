# VAT Notification System Deployment Guide

## Manual Deployment Commands:

```bash
# Deploy main VAT notifications function
supabase functions deploy vat-notifications

# Deploy overdue notifications function  
supabase functions deploy vat-overdue-notifications

# Deploy email function (if not already deployed)
supabase functions deploy send-email

# Deploy WhatsApp function (if not already deployed)
supabase functions deploy send-whatsapp
```

## Next steps:
1. Run setup-vat-cron-jobs.sql in Supabase SQL Editor
2. Set environment variables in Supabase Dashboard:
   - RESEND_API_KEY
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
3. Test with: supabase functions invoke vat-notifications

VAT notifications will run automatically every hour!