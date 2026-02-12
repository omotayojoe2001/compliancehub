-- Remove subscription entries from pricing_config
DELETE FROM pricing_config 
WHERE service_name IN ('subscription_basic', 'subscription_pro', 'subscription_enterprise');
