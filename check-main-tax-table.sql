-- Check the main tax_obligations table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tax_obligations' 
AND table_schema = 'public'
ORDER BY ordinal_position;