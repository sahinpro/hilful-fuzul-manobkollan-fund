import { getCachedLeadershipMembers } from "@/lib/cache/public-data";
import type { Database } from "@/types/database";

export type LeadershipMember = Database["public"]["Tables"]["leadership_members"]["Row"];

export async function fetchLeadershipMembers(): Promise<LeadershipMember[]> {
  return getCachedLeadershipMembers();
}
