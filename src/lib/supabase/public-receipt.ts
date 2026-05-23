import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let publicReceiptClient: SupabaseClient<Database> | null | undefined;

/**
 * Anon-only Supabase client for public receipt verification.
 * Uses SECURITY DEFINER RPCs — never the service role.
 */
export function createPublicReceiptSupabase(): SupabaseClient<Database> | null {
  if (publicReceiptClient !== undefined) {
    return publicReceiptClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    publicReceiptClient = null;
    return null;
  }

  publicReceiptClient = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return publicReceiptClient;
}

export function isPublicReceiptSupabaseConfigured(): boolean {
  return createPublicReceiptSupabase() != null;
}
