-- Grant table privileges on questions to Supabase roles
-- Run manually via Supabase Dashboard → SQL Editor → paste & execute
-- Fix: tables created via raw SQL do not receive automatic dashboard grants

-- service_role needs ALL for server-side admin writes (bypasses RLS)
grant all on table questions to service_role;

-- authenticated role needs SELECT for user-scoped reads (RLS policies apply)
grant select on table questions to authenticated;
