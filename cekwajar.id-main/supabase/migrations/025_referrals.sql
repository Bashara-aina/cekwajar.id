-- ══════════════════════════════════════════════════════════════════════════════
-- cekwajar.id — 025_referrals.sql
-- Revision plan 01 §8: referral tracking table
-- Each user gets a unique slug /r/[user_id_short].
-- Track: referrer_id, referred_id, paid_at, credited_at.
-- Cap at 12 free months / referrer / lifetime to prevent abuse.
-- Auto-credit referrer +30 days inside subscription_renews_at via trigger.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references auth.users(id) on delete cascade,
  referred_id     uuid not null references auth.users(id) on delete cascade,
  referred_paid_at timestamptz,
  credited_at     timestamptz,
  fraud_flag      boolean not null default false,
  unique (referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_idx  ON public.referrals(referred_id);

-- Trigger: when a payment for a referred user transitions to 'paid',
-- auto-credit the referrer by extending their subscription_renews_at by 30 days.
-- Cap: skip if referrer already has 12 credited months (365 days).
CREATE OR REPLACE FUNCTION public.handle_referral_credit()
RETURNS TRIGGER AS $$
DECLARE
  referrer_renews timestamptz;
  referrer_credits int;
BEGIN
  -- Only trigger on paid payments for referred users who haven't paid yet
  IF NEW.status = 'paid' AND NEW.user_id IS NOT NULL THEN
    -- Find referral record for this payment
    UPDATE public.referrals
    SET referred_paid_at = NEW.paid_at
    WHERE referred_id = NEW.user_id
      AND referred_paid_at IS NULL
    RETURNING referred_id INTO NEW.referred_id;

    -- Credit referrer: extend subscription_renews_at by 30 days, capped at 12 months
    SELECT subscription_renews_at INTO referrer_renews
    FROM public.user_profiles
    WHERE id = (SELECT referrer_id FROM public.referrals WHERE referred_id = NEW.user_id LIMIT 1);

    IF referrer_renews IS NOT NULL THEN
      SELECT COUNT(*) INTO referrer_credits
      FROM public.referrals
      WHERE referrer_id = (SELECT referrer_id FROM public.referrals WHERE referred_id = NEW.user_id LIMIT 1)
        AND credited_at IS NOT NULL;

      IF referrer_credits < 12 THEN
        UPDATE public.user_profiles
        SET subscription_renews_at = subscription_renews_at + interval '30 days'
        WHERE id = (SELECT referrer_id FROM public.referrals WHERE referred_id = NEW.user_id LIMIT 1);

        UPDATE public.referrals
        SET credited_at = now()
        WHERE referred_id = NEW.user_id AND credited_at IS NULL;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if re-running migration
DROP TRIGGER IF EXISTS on_payment_paid_credit_referrer ON public.payments;

CREATE TRIGGER on_payment_paid_credit_referrer
  AFTER UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_credit();