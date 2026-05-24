-- Semi-auto online donations: pending intents verified by treasurer, then confirmed into donations.

-- ---------------------------------------------------------------------------
-- Pending donor submissions (public API writes via service role only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donation_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_full_name text NOT NULL,
  donor_fathers_name text,
  amount_bdt numeric(14, 2) NOT NULL CHECK (amount_bdt > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('bkash', 'nagad')),
  trx_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
  source text NOT NULL DEFAULT 'donate'
    CHECK (source IN ('donate', 'claim')),
  access_token text NOT NULL UNIQUE,
  donation_id uuid REFERENCES public.donations (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT donation_intents_trx_id_nonempty CHECK (length(trim(trx_id)) >= 4)
);

CREATE UNIQUE INDEX IF NOT EXISTS donation_intents_provider_trx_key
  ON public.donation_intents (payment_method, upper(trim(trx_id)))
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX IF NOT EXISTS donation_intents_status_created_idx
  ON public.donation_intents (status, created_at DESC);

CREATE INDEX IF NOT EXISTS donation_intents_access_token_idx
  ON public.donation_intents (access_token);

-- ---------------------------------------------------------------------------
-- Link confirmed donations back to intents + store provider trx id
-- ---------------------------------------------------------------------------
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS trx_id text,
  ADD COLUMN IF NOT EXISTS intent_id uuid REFERENCES public.donation_intents (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS donations_provider_trx_key
  ON public.donations (payment_method, upper(trim(trx_id)))
  WHERE trx_id IS NOT NULL AND length(trim(trx_id)) > 0;

-- ---------------------------------------------------------------------------
-- RLS: block direct client access; app uses service role API routes
-- ---------------------------------------------------------------------------
ALTER TABLE public.donation_intents ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.donation_intents IS
  'Semi-auto donation queue: donor submits trx, treasurer confirms into donations.';
