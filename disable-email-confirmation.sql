-- Run this in Supabase SQL Editor to disable email confirmations
UPDATE auth.config 
SET enable_signup = true, enable_confirmations = false;