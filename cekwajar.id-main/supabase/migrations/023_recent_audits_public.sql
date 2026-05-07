-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — recent_audits_public view
-- De-identified feed of audits from the last 24 hours.
-- Consumed by src/components/home/LiveAuditTicker.tsx
-- Anon + authenticated SELECT granted so the homepage ticker works for all users.
-- ══════════════════════════════════════════════════════════════════════════════

create or replace view public.recent_audits_public as
select
  id,
  created_at,
  case
    when shortfall_idr < 100000 then 'tidak ada selisih signifikan'
    when shortfall_idr between 100000 and 500000 then format('IDR %sK', round(shortfall_idr/1000))
    else format('IDR %s.%sK',
                floor(shortfall_idr/1000000),
                lpad(round(mod(shortfall_idr,1000000)/1000)::text, 3, '0'))
  end as shortfall_display,
  -- de-identify: first name only
  initcap(split_part(mask_full_name, ' ', 1)) as first_name_only,
  city
from public.payslip_audits
where created_at > now() - interval '24 hours'
  and verdict in ('SESUAI', 'ADA_PELANGGARAN')
order by created_at desc
limit 50;

grant select on public.recent_audits_public to anon, authenticated;