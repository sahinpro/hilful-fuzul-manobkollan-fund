import { siteConfig } from "@/config/site";

/** bKash / Nagad Send Money number shown on the donate page. */
export function getMfsDonationNumber(): string | null {
  const fromEnv =
    process.env.NEXT_PUBLIC_MFS_DONATION_NUMBER?.trim() ||
    process.env.MFS_DONATION_NUMBER?.trim();
  if (fromEnv) return fromEnv;
  const phone = siteConfig.contact.phone?.trim();
  return phone || null;
}

export function isDonateFlowConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
      getMfsDonationNumber(),
  );
}
