-- Migration: subscription tier + premium report columns + ask quota index
-- Run manually via Supabase Dashboard → SQL Editor → paste & execute
-- Round 10A — tier data foundation (no UX gates yet)

-- ── 1. user_subscriptions ─────────────────────────────────────────────────────
-- One row per auth user; lazily created (no row = free tier).

create table public.user_subscriptions (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  tier       text not null default 'free' check (tier in ('free', 'paid')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_subscriptions enable row level security;

-- Users can read their own subscription row
create policy "user can read own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- Writes only through service_role admin client (no insert/update policy needed)
grant all    on public.user_subscriptions to service_role;
grant select on public.user_subscriptions to authenticated;

-- ── 2. profiles: premium report columns ──────────────────────────────────────
-- Mirrors the base_report column pattern.

alter table public.profiles
  add column if not exists premium_report              text,
  add column if not exists premium_report_status       text
    check (premium_report_status in ('pending', 'generating', 'done', 'failed')),
  add column if not exists premium_report_locale       text,
  add column if not exists premium_report_generated_at timestamptz;

-- ── 3. Index: ask quota query ─────────────────────────────────────────────────
-- getAskUsageToday() filters by (profile_id, created_at) — avoid seq scan.

create index if not exists idx_questions_profile_created
  on public.questions(profile_id, created_at);


-- ══════════════════════════════════════════════════════════════════════════════
-- Test / admin SQL (copy-paste into SQL editor as needed)
-- ══════════════════════════════════════════════════════════════════════════════

-- Upgrade a user to paid:
-- insert into user_subscriptions (user_id, tier)
-- values ('<your user_id>', 'paid')
-- on conflict (user_id) do update set tier = 'paid', updated_at = now();

-- Check:
-- select * from user_subscriptions where user_id = '<your user_id>';

-- Downgrade to free:
-- update user_subscriptions set tier = 'free', updated_at = now()
-- where user_id = '<your user_id>';
