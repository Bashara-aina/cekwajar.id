-- Migration: User Consents Table for UU PDP compliance
-- Creates the user_consents table for auditable PDP consent records

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_session_id text,
  consent_version text not null,
  general boolean not null default false,
  sensitive boolean not null default false,
  ip_hash text not null,
  user_agent text,
  given_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;

create policy "users_can_read_own_consents"
  on public.user_consents
  for select
  using (auth.uid() = user_id);

create policy "service_can_insert_consents"
  on public.user_consents
  for insert
  with check (true);

-- Index for fast consent lookup by user
create index if not exists idx_user_consents_user_id
  on public.user_consents(user_id);

-- Index for anon session lookups
create index if not exists idx_user_consents_anon_session
  on public.user_consents(anon_session_id)
  where anon_session_id is not null;

-- Function to migrate anonymous data to authenticated user
create or replace function public.migrate_anon_data(_anon_id text, _user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.payslip_audits
    set user_id = _user_id, anon_session_id = null
    where anon_session_id = _anon_id and user_id is null;

  update public.user_consents
    set user_id = _user_id, anon_session_id = null
    where anon_session_id = _anon_id and user_id is null;

  update public.salary_submissions
    set user_id = _user_id, anon_session_id = null
    where anon_session_id = _anon_id and user_id is null;

  insert into public.audit_migration_log (user_id, anon_id, migrated_at)
  values (_user_id, _anon_id, now())
  on conflict do nothing;
end
$$;

-- Audit migration log table
create table if not exists public.audit_migration_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  anon_id text not null,
  migrated_at timestamptz not null default now()
);

alter table public.audit_migration_log enable row level security;

create policy "users_can_read_own_migration_log"
  on public.audit_migration_log
  for select
  using (auth.uid() = user_id);
