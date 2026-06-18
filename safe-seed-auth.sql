-- SAFE SEED AUTH SCRIPT
-- I have already created the 3 accounts using the Supabase API to ensure the auth schema is perfectly intact.
-- Please run this script in your Supabase SQL Editor to confirm their emails and assign their correct roles.

-- 1. Confirm emails
update auth.users
set email_confirmed_at = now()
where email in (
  'student@mbcmumbai.com', 
  'teacher@mbcmumbai.com', 
  'admin@mbcmumbai.com'
);

-- 2. Ensure they are mapped to the correct roles in public.profiles
update public.profiles
set account_type_id = (select id from public.account_types where role = 'teacher' limit 1)
where email = 'teacher@mbcmumbai.com';

update public.profiles
set account_type_id = (select id from public.account_types where role = 'admin' limit 1)
where email = 'admin@mbcmumbai.com';

update public.profiles
set account_type_id = (select id from public.account_types where role = 'student' limit 1)
where email = 'student@mbcmumbai.com';
