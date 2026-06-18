# Supabase Setup

This folder contains the MBC Portal v2 database schema.

## Apply The Schema

Use either the Supabase dashboard SQL editor or the Supabase CLI.

```bash
supabase db push
```

If you are using the dashboard, paste the SQL from:

```text
supabase/migrations/20260612000100_initial_mbcportal_schema.sql
```

## Environment Variables

Fill these values in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Legacy Mapping

The migration intentionally normalizes old comma-separated legacy fields:

- `savsoft_users.gid` -> `profile_groups`
- `savsoft_quiz.gids` -> `quiz_groups`
- `savsoft_quiz.uids` -> `quiz_users`
- `savsoft_quiz.qids` -> `quiz_questions`
- `savsoft_qcl` -> `quiz_selection_rules`
- assignment/study material group fields -> join tables

Legacy IDs are kept as nullable `legacy_*` columns so old MySQL data can be imported in phases.

## Local Admin User Seed

Prefer creating test users with the Supabase Admin API instead of raw SQL:

```bash
npm run seed:test-users
```

This requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

If the users were already created manually with raw SQL and login returns `Database error querying schema`, run this cleanup file in the Supabase SQL editor first:

```text
supabase/cleanup-test-users.sql
```

Then run `npm run seed:test-users` to create:

```text
student@mbcmumbai.com
teacher@mbcmumbai.com
admin@mbcmumbai.com
```
