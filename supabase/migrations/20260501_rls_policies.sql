-- audit 10 §2: RLS policies for all user-facing tables
-- Run this in Supabase SQL editor after reviewing existing policies

-- Enable RLS on all user-facing tables
alter table public.user_profiles enable row level security;
alter table public.payslip_audits enable row level security;
alter table public.payments enable row level security;
alter table public.refund_requests enable row level security;
alter table public.referrals enable row level security;
alter table public.audit_files enable row level security;

-- user_profiles: user can read/update only their own row
drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles
  for select using (auth.uid() = id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own" on public.user_profiles
  for update using (auth.uid() = id);

-- payslip_audits: user can read/insert only their own
drop policy if exists "payslip_audits_select_own" on public.payslip_audits;
create policy "payslip_audits_select_own" on public.payslip_audits
  for select using (auth.uid() = user_id);

drop policy if exists "payslip_audits_insert_own" on public.payslip_audits;
create policy "payslip_audits_insert_own" on public.payslip_audits
  for insert with check (auth.uid() = user_id);

-- payments: user can read only their own payments
-- Insert/update handled only by service-role webhook handler
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

-- refund_requests: user can insert/select only their own
drop policy if exists "refund_requests_insert_own" on public.refund_requests;
create policy "refund_requests_insert_own" on public.refund_requests
  for insert with check (auth.uid() = user_id);

drop policy if exists "refund_requests_select_own" on public.refund_requests;
create policy "refund_requests_select_own" on public.refund_requests
  for select using (auth.uid() = user_id);

-- referrals: referrer can see referrals where they are the referrer
drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id);

-- audit_files: user can read only their own
drop policy if exists "audit_files_select_own" on public.audit_files;
create policy "audit_files_select_own" on public.audit_files
  for select using (auth.uid() = user_id);