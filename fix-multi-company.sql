-- Remove the unique constraint that's preventing multiple companies per user
ALTER TABLE company_profiles DROP CONSTRAINT company_profiles_user_id_unique;

-- Clear any existing data
DELETE FROM company_profiles;

-- Insert each company as a separate record with the correct user_id mapping
INSERT INTO company_profiles (user_id, company_name, tin, address, phone, is_primary, created_at, updated_at) VALUES
('f879bc6f-8ea9-47eb-8ff9-4495df531a53', 'Topup9ja', '', '', '07016190271', false, '2025-12-25 07:00:15.678749+00', '2025-12-25 07:12:28.510779+00'),
('f879bc6f-8ea9-47eb-8ff9-4495df531a53', 'Sportsprofit', '', '', '07049163283', false, '2025-12-25 16:23:40.151069+00', '2025-12-25 16:23:40.151069+00'),
('f879bc6f-8ea9-47eb-8ff9-4495df531a53', 'Joshua Omotayo', '', '', '07016190271', true, '2025-12-24 09:20:20.895564+00', '2025-12-24 09:20:20.895564+00');