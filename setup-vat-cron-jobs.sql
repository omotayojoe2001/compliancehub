-- Create Supabase Cron Jobs for VAT Notifications
-- This will run the VAT notification function every hour

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule VAT notifications to run every hour
SELECT cron.schedule(
  'vat-notifications-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := 'https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/vat-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule overdue notifications to run daily at 9 AM
SELECT cron.schedule(
  'vat-overdue-daily',
  '0 9 * * *', -- Daily at 9 AM
  $$
  SELECT
    net.http_post(
      url := 'https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/vat-overdue-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;