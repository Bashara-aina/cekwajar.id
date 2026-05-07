-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — 022_collapse_tier_basic.sql
-- Revision plan 01: collapse to single Pro tier at IDR 49.000
-- Auto-upgrade basic users, block new basic inserts
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Auto-upgrade existing 'basic' subscribers to 'pro' at no cost
UPDATE public.user_profiles
SET subscription_tier = 'pro',
    updated_at = now(),
    upgraded_at = now(),
    upgraded_reason = 'tier_collapse_to_single_pro_2026_05'
WHERE subscription_tier = 'basic';

-- 2. Add upgraded_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'upgraded_at'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN upgraded_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'upgraded_reason'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN upgraded_reason TEXT;
  END IF;
END $$;

-- 3. Remove 'basic' from CHECK constraint and replace with stricter constraint
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'pro'));

-- 4. Create payments table (if not exists) — used by refund endpoint
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  midtrans_order_id TEXT NOT NULL UNIQUE,
  amount_idr BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create refund_requests table (if not exists)
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_midtrans_order_id_idx ON public.payments(midtrans_order_id);
CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON public.payments(paid_at);
CREATE INDEX IF NOT EXISTS refund_requests_user_id_idx ON public.refund_requests(user_id);