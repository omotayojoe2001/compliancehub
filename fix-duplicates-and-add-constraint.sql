-- Remove duplicate entries, keeping only the most recent one for each user_id
DELETE FROM company_profiles 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM company_profiles 
    ORDER BY user_id, created_at DESC
);

-- Now add the unique constraint
ALTER TABLE company_profiles ADD CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id);