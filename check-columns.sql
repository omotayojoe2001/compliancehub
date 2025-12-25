-- Check column structure of tax_obligations table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tax_obligations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check user_tax_obligations structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_tax_obligations' 
AND table_schema = 'public'
ORDER BY ordinal_position;