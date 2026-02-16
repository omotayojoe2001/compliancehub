-- Add missing business fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rc_number TEXT,
ADD COLUMN IF NOT EXISTS tin TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deadline_alerts BOOLEAN DEFAULT false;
