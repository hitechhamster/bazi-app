-- Migration: locale persistence — user preferences + AI content locale tagging
-- Run manually via Supabase Dashboard → SQL Editor → paste & execute
-- Stage 4 Batch 1 Commit 2

-- ── User locale preference ────────────────────────────────────────────────────

create table user_preferences (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  locale     text not null default 'en'
               check (locale in ('en', 'zh-CN', 'zh-TW')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

create policy "Users read own prefs"
  on user_preferences for select
  to authenticated
  using (user_id = auth.uid());

-- service_role for admin upserts (server action bypasses RLS)
grant all    on user_preferences to service_role;
grant select on user_preferences to authenticated;

-- ── Locale tagging on AI-generated content ────────────────────────────────────
-- Default 'en' retroactively labels all existing rows as English (which they are).
--
-- Column naming follows the existing content column prefixes:
--   report_structured  → report_structured_locale
--   base_report        → base_report_locale
--   daily_reading      → daily_reading_locale
--   questions.answer   → questions.locale

alter table profiles
  add column report_structured_locale text not null default 'en'
    check (report_structured_locale in ('en', 'zh-CN', 'zh-TW'));

alter table profiles
  add column base_report_locale text not null default 'en'
    check (base_report_locale in ('en', 'zh-CN', 'zh-TW'));

alter table profiles
  add column daily_reading_locale text not null default 'en'
    check (daily_reading_locale in ('en', 'zh-CN', 'zh-TW'));

alter table questions
  add column locale text not null default 'en'
    check (locale in ('en', 'zh-CN', 'zh-TW'));
