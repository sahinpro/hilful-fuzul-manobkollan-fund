import { AdminChrome } from "@/components/admin/admin-chrome";
import { AdminI18nProvider } from "@/components/admin/admin-i18n-provider";
import { ADMIN_LOCALE_COOKIE, parseAdminLocaleCookie } from "@/lib/i18n/admin-locale";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = parseAdminLocaleCookie(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);

  return (
    <AdminI18nProvider cookieLocale={cookieLocale}>
      <AdminChrome>{children}</AdminChrome>
    </AdminI18nProvider>
  );
}
