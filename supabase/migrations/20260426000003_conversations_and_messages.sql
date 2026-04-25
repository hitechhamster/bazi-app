-- Migration: conversations + messages tables for multi-turn chat feature
-- Run manually via Supabase Dashboard → SQL Editor → paste & execute
-- Stage 4 Batch 2 Commit 1

-- ── Conversations ─────────────────────────────────────────────────────────────

create table conversations (
  id         uuid    primary key default gen_random_uuid(),
  profile_id uuid    not null references profiles(id) on delete cascade,
  title      text    not null default 'New conversation',
  locale     text    not null default 'en'
               check (locale in ('en', 'zh-CN', 'zh-TW')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Primary access pattern: all conversations for a profile, newest first
create index conversations_profile_updated_idx
  on conversations(profile_id, updated_at desc);

alter table conversations enable row level security;

-- Users can read conversations belonging to profiles they own
create policy "Users read own conversations"
  on conversations for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = conversations.profile_id
        and profiles.user_id = auth.uid()
    )
  );

-- Inserts, updates, and deletes are done via admin client only (server actions)
-- No client-side insert/update/delete policy needed

grant all    on conversations to service_role;
grant select on conversations to authenticated;

-- ── Messages ──────────────────────────────────────────────────────────────────
-- turn_number is shared by the user message and its assistant reply (same turn).
-- status only matters for assistant rows; user rows are inserted with status='done'.

create table messages (
  id              uuid    primary key default gen_random_uuid(),
  conversation_id uuid    not null references conversations(id) on delete cascade,
  role            text    not null check (role in ('user', 'assistant')),
  content         text    not null,
  status          text    not null default 'done'
                    check (status in ('pending', 'generating', 'done', 'failed')),
  error           text,
  turn_number     integer not null,
  created_at      timestamptz not null default now()
);

-- Primary access pattern: all messages for a conversation, ordered for display
create index messages_conversation_idx
  on messages(conversation_id, turn_number asc, created_at asc);

alter table messages enable row level security;

-- Users can read messages in conversations belonging to profiles they own
create policy "Users read own messages"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from conversations c
      join profiles p on c.profile_id = p.id
      where c.id = messages.conversation_id
        and p.user_id = auth.uid()
    )
  );

-- Inserts and updates are done via admin client only (server actions)
-- No client-side insert/update policy needed

grant all    on messages to service_role;
grant select on messages to authenticated;
