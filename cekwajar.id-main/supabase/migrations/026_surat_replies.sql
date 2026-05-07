-- Migration: 026_surat_replies
-- SuratKeberatan reply storage (objection letters + WA templates)
-- Upserted per audit_id so users can regenerate/replace

CREATE TABLE IF NOT EXISTS surat_replies (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id    UUID NOT NULL REFERENCES payslip_audits(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_text TEXT NOT NULL,
  letter_source TEXT NOT NULL CHECK (letter_source IN ('groq', 'fallback')),
  wa_template_1 TEXT NOT NULL,
  wa_template_2 TEXT NOT NULL,
  wa_template_3 TEXT NOT NULL,
  wa_source TEXT NOT NULL CHECK (wa_source IN ('groq', 'fallback')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT surat_replies_audit_user_unique UNIQUE (audit_id, user_id)
);

CREATE INDEX IF NOT EXISTS surat_replies_audit_id_idx ON surat_replies (audit_id);
CREATE INDEX IF NOT EXISTS surat_replies_user_id_idx ON surat_replies (user_id);

ALTER TABLE surat_replies ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own replies
CREATE POLICY "Users manage own surat_replies" ON surat_replies
  FOR ALL USING (auth.uid() = user_id);
