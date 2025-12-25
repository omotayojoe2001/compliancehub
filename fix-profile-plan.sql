-- Fix profile plan to match actual payment
-- You paid ₦100 (10000 kobo) which should be test100 plan, not basic

UPDATE profiles 
SET plan = 'test100'
WHERE id = 'f879bc6f-8ea9-47eb-8ff9-4495df531a53';