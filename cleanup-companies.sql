-- Clean up duplicate companies and fix data issues

-- Remove duplicate companies (keep the most recent one for each user/company_name combination)
DELETE FROM company_profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, company_name) id
  FROM company_profiles 
  ORDER BY user_id, company_name, created_at DESC
);

-- Ensure each user has at least one primary company
UPDATE company_profiles 
SET is_primary = true 
WHERE user_id IN (
  SELECT user_id 
  FROM company_profiles 
  GROUP BY user_id 
  HAVING COUNT(*) > 0 
  AND SUM(CASE WHEN is_primary THEN 1 ELSE 0 END) = 0
) 
AND id IN (
  SELECT DISTINCT ON (user_id) id 
  FROM company_profiles 
  ORDER BY user_id, created_at ASC
);

-- Update any empty company names
UPDATE company_profiles 
SET company_name = 'My Business' 
WHERE company_name IS NULL OR company_name = '';

-- Clean up any orphaned records
DELETE FROM company_profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);