-- Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Get user ID
SELECT id FROM auth.users WHERE email = 'gooddeedsdatasaver@gmail.com';

-- Insert profile with correct user ID
INSERT INTO profiles (id, email, business_name, phone)
VALUES ('9e373b74-f938-4766-adb2-76e61bee0108', 'gooddeedsdatasaver@gmail.com', 'Good Deeds', '2348012345678');
