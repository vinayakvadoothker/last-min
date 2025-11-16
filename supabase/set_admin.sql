-- Set vinvadoothker@gmail.com as admin
-- Run this in Supabase SQL Editor after user signs up

-- This will set the user with email vinvadoothker@gmail.com as admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'vinvadoothker@gmail.com';

-- If the profile doesn't exist yet, you'll need to run this after they sign up
-- Or manually create the profile in Supabase dashboard

