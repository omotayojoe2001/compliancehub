-- Check if tax_obligations table exists and has correct structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tax_obligations';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tax_obligations';

-- Check if there are any records
SELECT COUNT(*) FROM tax_obligations;

-- Recreate tax_obligations table with proper structure
DROP TABLE IF EXISTS tax_obligations CASCADE;

CREATE TABLE tax_obligations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references auth.users(id),
  obligation_type text NOT NULL,
  next_due_date timestamp with time zone,
  tax_period text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Disable RLS completely
ALTER TABLE tax_obligations DISABLE ROW LEVEL SECURITY;