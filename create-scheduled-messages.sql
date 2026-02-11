-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL, -- 'all' or 'individual'
  target_email TEXT,
  target_phone TEXT,
  send_via_email BOOLEAN DEFAULT false,
  send_via_whatsapp BOOLEAN DEFAULT false,
  email_subject TEXT,
  message_body TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_time ON scheduled_messages(scheduled_time, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages(status);

-- Enable RLS
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage
CREATE POLICY "Authenticated users can manage scheduled messages"
ON scheduled_messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
