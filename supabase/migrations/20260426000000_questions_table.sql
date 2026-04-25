-- Migration: questions table for Ask a Question feature
-- Run manually via Supabase Dashboard → SQL Editor → paste & execute
-- Stage 3 Batch 3

create table questions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  question text not null,
  answer text,
  status text not null default 'pending' check (status in ('pending','generating','done','failed')),
  error text,
  created_at timestamptz not null default now()
);

create index questions_profile_id_created_at_idx
  on questions(profile_id, created_at desc);

-- RLS: mirror the existing profiles RLS pattern
alter table questions enable row level security;

-- Users can read their own questions (questions belonging to profiles they own)
create policy "Users can read own questions"
  on questions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = questions.profile_id
        and profiles.user_id = auth.uid()
    )
  );

-- Inserts and updates are done via admin client only (server actions)
-- No client-side insert/update policy needed
