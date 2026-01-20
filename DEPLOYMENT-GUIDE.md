# VAT Notification System Deployment

## Step 1: Deploy Edge Functions

Run these commands in your terminal:

```bash
supabase functions deploy vat-notifications
supabase functions deploy vat-overdue-notifications  
supabase functions deploy send-email
supabase functions deploy send-whatsapp
```

## Step 2: Setup Cron Jobs

Run `setup-vat-cron-jobs.sql` in Supabase SQL Editor

## Step 3: Set Environment Variables

In Supabase Dashboard → Project Settings → Edge Functions → Environment Variables:

- `RESEND_API_KEY`: Your Resend API key
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID  
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token

## Step 4: Test

```bash
supabase functions invoke vat-notifications
supabase functions invoke vat-overdue-notifications
```

## Result

VAT notifications will run automatically:
- **Every hour** for scheduled notifications
- **Daily at 9 AM** for overdue notifications

Users will receive exactly 15 notifications per month as specified!