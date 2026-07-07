-- Amazon Shipping Opportunity Copilot Supabase schema.
-- Run this in the Supabase SQL editor before using automation/sync_supabase.py.
--
-- Demo note:
-- These policies allow reads/inserts/updates with the anon key for a class MVP.
-- For production, replace them with authenticated-user policies or a server-side
-- service role flow.

create extension if not exists pgcrypto;

create table if not exists public.amazon_copilot_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  case_id text not null,
  company text not null,
  recommendation text not null,
  passed boolean not null,
  iterations integer not null,
  opportunity_score integer,
  win_probability numeric,
  serviceable_daily_volume integer,
  serviceable_annual_volume integer,
  export_status text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.amazon_copilot_sources (
  id uuid primary key default gen_random_uuid(),
  run_key text not null references public.amazon_copilot_runs(run_key) on delete cascade,
  case_id text not null,
  evidence_id text not null,
  source text not null,
  locator text,
  claim text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_key, evidence_id)
);

create table if not exists public.amazon_copilot_documents (
  id uuid primary key default gen_random_uuid(),
  source_file text not null unique,
  case_ids text[] not null default '{}',
  original_folder text,
  working_extracts_folder text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.amazon_copilot_runs enable row level security;
alter table public.amazon_copilot_sources enable row level security;
alter table public.amazon_copilot_documents enable row level security;

drop policy if exists "amazon copilot anon read runs" on public.amazon_copilot_runs;
drop policy if exists "amazon copilot anon insert runs" on public.amazon_copilot_runs;
drop policy if exists "amazon copilot anon update runs" on public.amazon_copilot_runs;
drop policy if exists "amazon copilot anon read sources" on public.amazon_copilot_sources;
drop policy if exists "amazon copilot anon insert sources" on public.amazon_copilot_sources;
drop policy if exists "amazon copilot anon update sources" on public.amazon_copilot_sources;
drop policy if exists "amazon copilot anon read documents" on public.amazon_copilot_documents;
drop policy if exists "amazon copilot anon insert documents" on public.amazon_copilot_documents;
drop policy if exists "amazon copilot anon update documents" on public.amazon_copilot_documents;

create policy "amazon copilot anon read runs"
  on public.amazon_copilot_runs for select to anon using (true);
create policy "amazon copilot anon insert runs"
  on public.amazon_copilot_runs for insert to anon with check (true);
create policy "amazon copilot anon update runs"
  on public.amazon_copilot_runs for update to anon using (true) with check (true);

create policy "amazon copilot anon read sources"
  on public.amazon_copilot_sources for select to anon using (true);
create policy "amazon copilot anon insert sources"
  on public.amazon_copilot_sources for insert to anon with check (true);
create policy "amazon copilot anon update sources"
  on public.amazon_copilot_sources for update to anon using (true) with check (true);

create policy "amazon copilot anon read documents"
  on public.amazon_copilot_documents for select to anon using (true);
create policy "amazon copilot anon insert documents"
  on public.amazon_copilot_documents for insert to anon with check (true);
create policy "amazon copilot anon update documents"
  on public.amazon_copilot_documents for update to anon using (true) with check (true);

grant select, insert, update on public.amazon_copilot_runs to anon;
grant select, insert, update on public.amazon_copilot_sources to anon;
grant select, insert, update on public.amazon_copilot_documents to anon;
