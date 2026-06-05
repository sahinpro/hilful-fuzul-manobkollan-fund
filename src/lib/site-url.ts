/** Public site origin used for auth redirects and metadata. No trailing slash. */
export function getSiteUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return url || null;
}

/** Admin password-reset landing path (must be allowlisted in Supabase redirect URLs). */
export function getAdminResetPasswordUrl(): string | null {
  const siteUrl = getSiteUrl();
  return siteUrl ? `${siteUrl}/admin/reset-password` : null;
}
