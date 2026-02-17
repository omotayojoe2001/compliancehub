-- Run this in Supabase SQL Editor to see your upcoming notifications

-- 1. Check scheduled messages (manual automations)
SELECT 
  id,
  target_email,
  target_phone,
  message_body,
  scheduled_time,
  status,
  send_via_email,
  send_via_whatsapp,
  created_at
FROM scheduled_messages
WHERE status = 'pending'
AND scheduled_time >= NOW()
ORDER BY scheduled_time ASC;

-- 2. Check your tax obligations and due dates
SELECT *
FROM tax_obligations
WHERE user_id = 'f879bc6f-8ea9-47eb-8ff9-4495df531a53' -- Your user ID
LIMIT 10;

-- 3. Check your profile settings
SELECT 
  email,
  phone,
  business_name,
  vat_status,
  paye_status,
  email_notifications,
  whatsapp_notifications,
  deadline_alerts
FROM profiles
WHERE id = 'f879bc6f-8ea9-47eb-8ff9-4495df531a53';
