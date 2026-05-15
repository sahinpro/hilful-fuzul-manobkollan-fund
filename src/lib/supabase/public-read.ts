import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let publicReadClient: SupabaseClient<Database> | null | undefined;

/**
 * Stateless Supabase client for cached public reads (no cookies).
 * Prefers service role when configured so views/RPC work reliably server-side.
 */
export function createPublicReadSupabase(): SupabaseClient<Database> | null {
  if (publicReadClient !== undefined) {
    return publicReadClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    publicReadClient = null;
    return null;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;
  if (!key) {
    publicReadClient = null;
    return null;
  }

  publicReadClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return publicReadClient;
}

export function isPublicReadSupabaseConfigured(): boolean {
  return createPublicReadSupabase() != null;
}
