-- Donor name search for public receipt verification (published donations only).

CREATE OR REPLACE FUNCTION public.public_receipt_search_donor_name(
  p_donor_name text,
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
  v_name text;
  v_pattern text;
  v_limit integer;
  v_results json;
BEGIN
  v_name := trim(COALESCE(p_donor_name, ''));
  IF length(v_name) < 3 OR length(v_name) > 80 THEN
    RETURN '[]'::json;
  END IF;

  v_pattern := '%' || replace(replace(replace(lower(v_name), '\', '\\'), '%', '\%'), '_', '\_') || '%';
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
      AND (
        lower(trim(COALESCE(don.full_name, ''))) LIKE v_pattern ESCAPE '\'
        OR lower(trim(COALESCE(don.fathers_name, ''))) LIKE v_pattern ESCAPE '\'
      )
      AND (
        p_payment_method IS NULL
        OR trim(p_payment_method) = ''
        OR lower(trim(p_payment_method)) = 'all'
        OR lower(d.payment_method) = lower(trim(p_payment_method))
      )
    ORDER BY don.full_name, r.receipt_no
    LIMIT v_limit
  ) t;

  RETURN v_results;
END;
$$;

REVOKE ALL ON FUNCTION public.public_receipt_search_donor_name(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_receipt_search_donor_name(text, text, integer) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.public_receipt_search_donor_name IS
  'Substring donor name search (min 3 chars); published donations only.';
