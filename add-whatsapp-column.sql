-- Add WhatsApp API key column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS whatsapp_api_key TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_whatsapp ON user_profiles(whatsapp_api_key) 
WHERE whatsapp_api_key IS NOT NULL;
