-- VERIFY CURRENT DATA COUNTS
-- Expected: 1 user, 9 companies, 2 subscriptions

SELECT 
    (SELECT COUNT(*) FROM user_profiles) as current_users,
    (SELECT COUNT(*) FROM company_profiles) as current_companies,
    (SELECT COUNT(*) FROM subscriptions) as current_subscriptions,
    CASE 
        WHEN (SELECT COUNT(*) FROM user_profiles) = 1 
         AND (SELECT COUNT(*) FROM company_profiles) = 9 
         AND (SELECT COUNT(*) FROM subscriptions) = 2 
        THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as verification_status;