-- Remove the unique constraint
ALTER TABLE company_profiles DROP CONSTRAINT IF EXISTS company_profiles_user_id_unique;

-- Clear existing data
DELETE FROM company_profiles;

-- Add your 3 companies to company_profiles table
INSERT INTO company_profiles (id, user_id, company_name, tin, address, phone, is_primary, created_at, updated_at) VALUES
('f056fa27-ac4e-474c-abdf-f2230740dfbc', 'f879bc6f-8ea9-47eb-8ff9-4495df531a53', 'Topup9ja', '', '', '07016190271', false, '2025-12-25 07:00:15.678749+00', '2025-12-25 07:12:28.510779+00'),
('c07862c6-5453-484f-9204-94a39fa451b1', 'f879bc6f-8ea9-47eb-8ff9-4495df531a53', 'Sportsprofit', '', '', '07049163283', false, '2025-12-25 16:23:40.151069+00', '2025-12-25 16:23:40.151069+00'),
('f879bc6f-8ea9-47eb-8ff9-4495df531a53', 'f879bc6f-8ea9-47eb-8ff9-4495df531a53', 'Joshua Omotayo', '', '', '07016190271', true, '2025-12-24 09:20:20.895564+00', '2025-12-24 09:20:20.895564+00');