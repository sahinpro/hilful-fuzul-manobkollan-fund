# Supabase migrations

## Apply receipt verification migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Paste and run `migrations/20260523120000_public_receipt_system.sql`.
3. Confirm functions exist: `ensure_donation_receipt`, `public_receipt_lookup_exact`, `public_receipt_search_prefix`, `public_receipt_search_donor_name`.

Or with Supabase CLI:

```bash
supabase link
supabase db push
```

## What this migration adds

- **Canonical `receipts` rows** for every donation (backfill + `ensure_donation_receipt`).
- **Indexed** exact and prefix search on `receipt_no`.
- **SECURITY DEFINER RPCs** so the public site uses the **anon key** only (no service role for verification).
- **Prefix search** requires at least 4 characters (reduces metadata leakage).

After applying, redeploy the Next.js app. New donations automatically get receipt rows via the admin API.

## Semi-auto online donations (`20260525120000_donation_intents_semi_auto.sql`)

1. Run `migrations/20260525120000_donation_intents_semi_auto.sql` in the SQL Editor (or `supabase db push`).
2. Set environment variables on the Next.js host:
   - `NEXT_PUBLIC_MFS_DONATION_NUMBER` — bKash/Nagad Send Money number (optional; falls back to site contact phone).
   - Existing `SUPABASE_SERVICE_ROLE_KEY` — required for `/api/donate/*` and admin confirm routes.
3. Public flow: `/donate` → treasurer confirms at `/admin/donation-intents` → donor prints receipt from status page.
