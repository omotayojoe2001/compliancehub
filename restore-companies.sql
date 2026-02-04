-- Recreate your companies in company_profiles table from profiles data
INSERT INTO company_profiles (user_id, company_name, tin, address, phone, created_at, updated_at)
SELECT 
    'f879bc6f-8ea9-47eb-8ff9-4495df531a53' as user_id,
    business_name as company_name,
    '' as tin,
    '' as address, 
    phone,
    created_at,
    updated_at
FROM profiles 
WHERE id IN (
    'f056fa27-ac4e-474c-abdf-f2230740dfbc',  -- Topup9ja
    'c07862c6-5453-484f-9204-94a39fa451b1',  -- Sportsprofit  
    'f879bc6f-8ea9-47eb-8ff9-4495df531a53'   -- Joshua Omotayo
);