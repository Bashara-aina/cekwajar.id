-- =============================================================================
-- cekwajar.id — 020_consent_and_cleanup.sql
-- UU PDP compliance: consent management and 30-day auto-delete
--
-- Contents:
--   1. user_consents table (upserted by /api/consent)
--   2. pg_cron job for 30-day payslip cleanup
--   3. SQL cleanup function (called by pg_cron)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. user_consents — policy version based consent tracking
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_version TEXT NOT NULL,
  privacy_policy_accepted BOOLEAN NOT NULL DEFAULT false,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  marketing_accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT
);

-- RLS: users can only read/write their own consent records
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_consent" ON user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_consent" ON user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_consent" ON user_consents
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for fast lookup by user + version
CREATE INDEX IF NOT EXISTS idx_user_consents_user_version
  ON user_consents(user_id, policy_version DESC);

-- ----------------------------------------------------------------------------
-- 2. cleanup function — deletes payslip files + audit records older than 30d
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cleanup_old_payslips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_date TIMESTAMPTZ := now() - INTERVAL '30 days';
  deleted_audits_count INTEGER := 0;
  deleted_files_count INTEGER := 0;
  audit_record RECORD;
  storage_paths TEXT[] := '{}';
BEGIN
  -- Collect storage paths for records due for deletion
  FOR audit_record IN
    SELECT id, payslip_file_path
    FROM payslip_audits
    WHERE delete_at < cutoff_date
      AND payslip_file_path IS NOT NULL
  LOOP
    storage_paths := array_append(storage_paths, audit_record.payslip_file_path);
  END LOOP;

  -- Delete storage files
  IF array_length(storage_paths, 1) > 0 THEN
    BEGIN
      PERFORM supabase.storage.from('payslips').delete(storage_paths);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Storage cleanup skipped: %', SQLERRM;
    END;
  END IF;

  -- Delete audit records (files are already removed or will be orphaned)
  DELETE FROM payslip_audits
  WHERE delete_at < cutoff_date;

  GET DIAGNOSTICS deleted_audits_count = ROW_COUNT;

  RAISE NOTICE 'cleanup_old_payslips: deleted % audit records at %', deleted_audits_count, now();
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. pg_cron job — runs daily at 02:00 AM
-- ----------------------------------------------------------------------------

SELECT cron.schedule(
  'cleanup-payslips-30days',
  '0 2 * * *',
  $$
    SELECT cleanup_old_payslips();
  $$
);

COMMENT ON FUNCTION cleanup_old_payslips() IS
  'Deletes payslip_audits older than 30 days and removes corresponding storage files. Called by pg_cron daily at 02:00.';