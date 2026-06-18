-- Run this in Supabase SQL Editor only if the test users were created manually
-- with raw SQL and login returns "Database error querying schema".
--
-- After this cleanup, recreate the users with:
-- npm run seed:test-users

delete from public.profiles
where email in (
  'student@mbcmumbai.com',
  'teacher@mbcmumbai.com',
  'admin@mbcmumbai.com',
  'user@mbcmumbai.com'
);

delete from auth.identities
where provider = 'email'
  and provider_id in (
    'student@mbcmumbai.com',
    'teacher@mbcmumbai.com',
    'admin@mbcmumbai.com',
    'user@mbcmumbai.com'
  );

delete from auth.users
where email in (
  'student@mbcmumbai.com',
  'teacher@mbcmumbai.com',
  'admin@mbcmumbai.com',
  'user@mbcmumbai.com'
);
