-- Public receipt verification: canonical receipt rows, indexed search, SECURITY DEFINER RPCs.
-- Apply in Supabase SQL Editor or: supabase db push

-- ---------------------------------------------------------------------------
-- Canonical receipt number (matches app deriveReceiptNo)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_receipt_no(p_donation_id uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT 'HF-' || upper(substr(replace(p_donation_id::text, '-', ''), 1, 12));
$$;

-- ---------------------------------------------------------------------------
-- Ensure every donation has exactly one receipt row (service role only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_donation_receipt(p_donation_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_no text;
BEGIN
  SELECT r.receipt_no INTO v_no
  FROM public.receipts r
  WHERE r.donation_id = p_donation_id;

  IF v_no IS NOT NULL THEN
    RETURN v_no;
  END IF;

  v_no := public.generate_receipt_no(p_donation_id);

  INSERT INTO public.receipts (donation_id, receipt_no, extra_payload)
  VALUES (p_donation_id, v_no, '{}'::jsonb)
  ON CONFLICT (donation_id) DO UPDATE
    SET receipt_no = EXCLUDED.receipt_no
  RETURNING receipt_no INTO v_no;

  RETURN v_no;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_donation_receipt(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_donation_receipt(uuid) TO service_role;

-- Backfill missing receipt rows for existing donations
INSERT INTO public.receipts (donation_id, receipt_no, extra_payload)
SELECT d.id, public.generate_receipt_no(d.id), '{}'::jsonb
FROM public.donations d
WHERE NOT EXISTS (
  SELECT 1 FROM public.receipts r WHERE r.donation_id = d.id
)
ON CONFLICT (donation_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Indexes for exact + prefix search
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS receipts_receipt_no_upper_key
  ON public.receipts (upper(receipt_no));

CREATE INDEX IF NOT EXISTS receipts_receipt_no_pattern_idx
  ON public.receipts (receipt_no text_pattern_ops);

-- ---------------------------------------------------------------------------
-- Exact lookup (anon-safe via SECURITY DEFINER; published donations only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.public_receipt_lookup_exact(p_receipt_no text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized text;
  v_row record;
BEGIN
  v_normalized := upper(trim(replace(COALESCE(p_receipt_no, ''), ' ', '')));
  IF length(v_normalized) < 2 OR length(v_normalized) > 64 THEN
    RETURN NULL;
  END IF;

  SELECT
    r.receipt_no,
    d.id AS donation_id,
    d.amount_bdt::text AS amount_bdt,
    d.payment_method,
    d.received_at,
    COALESCE(NULLIF(trim(don.full_name), ''), '—') AS donor_name,
    NULLIF(trim(don.fathers_name), '') AS donor_fathers_name
  INTO v_row
  FROM public.receipts r
  INNER JOIN public.donations d ON d.id = r.donation_id
  LEFT JOIN public.donors don ON don.id = d.donor_id
  WHERE d.is_published = true
    AND upper(r.receipt_no) = v_normalized
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'receiptNo', v_row.receipt_no,
    'donationId', v_row.donation_id,
    'amountBdt', v_row.amount_bdt,
    'paymentMethod', v_row.payment_method,
    'receivedAt', v_row.received_at,
    'donorName', v_row.donor_name,
    'donorFathersName', v_row.donor_fathers_name
  );
END;
$$;

REVOKE ALL ON FUNCTION public.public_receipt_lookup_exact(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_receipt_lookup_exact(text) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Prefix search only (min 4 chars); no broad substring leak
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.public_receipt_search_prefix(
  p_prefix text,
  p_payment_method text DEFAULT NULL,
  p_limit integer DEFAULT 15
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix text;
  v_limit integer;
  v_results json;
BEGIN
  v_prefix := upper(trim(replace(COALESCE(p_prefix, ''), ' ', '')));
  IF length(v_prefix) < 4 THEN
    RETURN '[]'::json;
  END IF;

  v_limit := LEAST(GREATEST(COALESCE(p_limit, 15), 1), 30);

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t."receiptNo"), '[]'::json)
  INTO v_results
  FROM (
    SELECT
      r.receipt_no AS "receiptNo",
      d.id AS "donationId",
      d.amount_bdt::text AS "amountBdt",
      d.payment_method AS "paymentMethod",
      d.received_at AS "receivedAt",
      COALESCE(NULLIF(trim(don.full_name), ''), '—') AS "donorName",
      NULLIF(trim(don.fathers_name), '') AS "donorFathersName"
    FROM public.receipts r
    INNER JOIN public.donations d ON d.id = r.donation_id
    LEFT JOIN public.donors don ON don.id = d.donor_id
    WHERE d.is_published = true
      AND upper(r.receipt_no) LIKE v_prefix || '%'
      AND (
        p_payment_method IS NULL
        OR trim(p_payment_method) = ''
        OR lower(trim(p_payment_method)) = 'all'
        OR lower(d.payment_method) = lower(trim(p_payment_method))
      )
    ORDER BY r.receipt_no
    LIMIT v_limit
  ) t;

  RETURN v_results;
END;
$$;

REVOKE ALL ON FUNCTION public.public_receipt_search_prefix(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_receipt_search_prefix(text, text, integer) TO anon, authenticated, service_role;

-- Optional read-only view for internal reporting (not granted to anon)
CREATE OR REPLACE VIEW public.public_receipt_verification AS
SELECT
  r.receipt_no,
  d.id AS donation_id,
  d.amount_bdt,
  d.payment_method,
  d.received_at,
  COALESCE(NULLIF(trim(don.full_name), ''), '—') AS donor_name,
  NULLIF(trim(don.fathers_name), '') AS donor_fathers_name
FROM public.receipts r
INNER JOIN public.donations d ON d.id = r.donation_id
LEFT JOIN public.donors don ON don.id = d.donor_id
WHERE d.is_published = true;

COMMENT ON FUNCTION public.public_receipt_lookup_exact IS
  'Public exact receipt verification; published donations only.';
COMMENT ON FUNCTION public.public_receipt_search_prefix IS
  'Prefix-only receipt search (min 4 chars); published donations only.';
