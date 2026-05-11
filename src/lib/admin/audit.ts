import type { Json } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type ServiceClient = SupabaseClient<Database>;

export async function writeAuditLog(
  supabase: ServiceClient,
  row: {
    action: string;
    resource_type: string;
    resource_id: string | null;
    diff?: Json | null;
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    action: row.action,
    resource_type: row.resource_type,
    resource_id: row.resource_id,
    diff: row.diff ?? null,
    actor_user_id: null,
  });
  if (error) {
    console.error("audit_logs insert failed", error);
  }
}
