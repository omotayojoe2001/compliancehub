-- Check what columns exist in the main tax_obligations table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tax_obligations' 
AND table_schema = 'public'
ORDER BY ordinal_position;