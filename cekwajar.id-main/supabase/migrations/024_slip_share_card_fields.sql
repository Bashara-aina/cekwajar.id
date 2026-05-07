-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — 024_slip_share_card_fields.sql
-- Add fields needed for OG share card + audit analytics
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE payslip_audits
  ADD COLUMN IF NOT EXISTS shortfall_idr BIGINT,
  ADD COLUMN IF NOT EXISTS violation_count INTEGER,
  ADD COLUMN IF NOT EXISTS masked_first_name TEXT;

-- Index for share card lookup (public endpoint, no RLS on this query)
CREATE INDEX IF NOT EXISTS idx_payslip_audits_shortfall_public
  ON payslip_audits(id)
  WHERE shortfall_idr IS NOT NULL;