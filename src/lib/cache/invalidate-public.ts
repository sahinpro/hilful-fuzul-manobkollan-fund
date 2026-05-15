import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_PROFILES, PUBLIC_CACHE_TAGS } from "@/lib/cache/tags";

/** Purge cached donation/expense totals and ledger after admin finance writes. */
export function invalidatePublicFinanceCache(): void {
  revalidateTag(PUBLIC_CACHE_TAGS.transparencyTotals, PUBLIC_CACHE_PROFILES.finance);
  revalidateTag(PUBLIC_CACHE_TAGS.transparencyLedger, PUBLIC_CACHE_PROFILES.finance);
  revalidatePath("/");
  revalidatePath("/transparency");
}

/** Purge cached leadership roster after admin member writes. */
export function invalidateLeadershipCache(): void {
  revalidateTag(PUBLIC_CACHE_TAGS.leadership, PUBLIC_CACHE_PROFILES.leadership);
  revalidatePath("/about");
}
