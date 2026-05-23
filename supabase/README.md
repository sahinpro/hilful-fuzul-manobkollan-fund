# Supabase migrations

## Apply receipt verification migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Paste and run `migrations/20260523120000_public_receipt_system.sql`.
3. Confirm functions exist: `ensure_donation_receipt`, `public_receipt_lookup_exact`, `public_receipt_search_prefix`.

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
