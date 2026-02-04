-- Temporarily disable RLS for guides table to test access
ALTER TABLE guides DISABLE ROW LEVEL SECURITY;

-- Check if guides exist
SELECT COUNT(*) FROM guides;