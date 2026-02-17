-- FIX ALL PHONE NUMBERS IN DATABASE
-- Run this in Supabase SQL Editor

-- Step 1: Check current phone numbers (see what needs fixing)
SELECT 
  id,
  email,
  business_name,
  phone as old_phone,
  CASE
    -- Already correct format (234...)
    WHEN phone ~ '^234[0-9]{10}$' THEN phone
    -- Has +234, remove the +
    WHEN phone ~ '^\+234[0-9]{10}$' THEN REPLACE(phone, '+234', '234')
    -- Starts with 0 (like 08012345678), replace 0 with 234
    WHEN phone ~ '^0[0-9]{10}$' THEN REPLACE(phone, '0', '234')
    -- Has spaces or dashes, remove them and fix
    WHEN phone ~ '234' THEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
    -- Other formats, try to extract 10 digits and add 234
    ELSE '234' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
  END as new_phone
FROM profiles
WHERE phone IS NOT NULL
ORDER BY email;

-- Step 2: Actually update the phone numbers (RUN AFTER REVIEWING STEP 1)
UPDATE profiles
SET phone = CASE
    -- Already correct format (234...)
    WHEN phone ~ '^234[0-9]{10}$' THEN phone
    -- Has +234, remove the +
    WHEN phone ~ '^\+234[0-9]{10}$' THEN REPLACE(phone, '+234', '234')
    -- Starts with 0 (like 08012345678), replace 0 with 234
    WHEN phone ~ '^0[0-9]{10}$' THEN REPLACE(phone, '0', '234')
    -- Has spaces or dashes, remove them and fix
    WHEN phone ~ '234' THEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
    -- Other formats, try to extract 10 digits and add 234
    ELSE '234' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
  END
WHERE phone IS NOT NULL
AND phone !~ '^234[0-9]{10}$';  -- Only update incorrect formats

-- Step 3: Verify all phone numbers are now correct
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN phone ~ '^234[0-9]{10}$' THEN 1 END) as correct_format,
  COUNT(CASE WHEN phone !~ '^234[0-9]{10}$' THEN 1 END) as incorrect_format
FROM profiles
WHERE phone IS NOT NULL;
