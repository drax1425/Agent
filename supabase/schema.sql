-- Drax Agent Hub — Supabase schema
-- Run this in the Supabase SQL editor

create table if not exists agent_conversations (
  id         uuid primary key default gen_random_uuid(),
  agent_id   text not null check (agent_id in ('marketing', 'dev', 'coach', 'ideas')),
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now() not null
);

-- Index for fast per-agent history queries
create index if not exists idx_agent_conversations_agent_id_created
  on agent_conversations (agent_id, created_at asc);

-- For development: disable RLS so the anon key can read/write freely.
-- In production, add proper RLS policies tied to authenticated users.
alter table agent_conversations disable row level security;

-- Optional: enable RLS with permissive policy (authenticated users only)
-- alter table agent_conversations enable row level security;
-- create policy "allow_all_authenticated"
--   on agent_conversations for all
--   using (auth.role() = 'authenticated')
--   with check (auth.role() = 'authenticated');
