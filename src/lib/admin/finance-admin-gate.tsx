import { LockKeyhole } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminUser } from "@/lib/admin/auth";
import {
  ADMIN_LOCALE_COOKIE,
  DEFAULT_ADMIN_LOCALE,
  parseAdminLocaleCookie,
} from "@/lib/i18n/admin-locale";
import { createAdminTranslator } from "@/lib/i18n/admin-translate";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

/** When non-null, render this instead of finance admin children (Supabase missing or forbidden). */
export async function financeAdminGate(): Promise<ReactNode | null> {
  const cookieStore = await cookies();
  const locale =
    parseAdminLocaleCookie(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value) ?? DEFAULT_ADMIN_LOCALE;
  const t = createAdminTranslator(locale);

  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
        <header className="mb-8 border-b border-border pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("gates.supabaseTitle")}</h1>
              <p className="mt-2 max-w-3xl text-base text-muted-foreground md:text-lg">
                {t("gates.supabaseSubtitle")}
              </p>
            </div>
          </div>
        </header>
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {t("gates.supabaseBody")}
        </p>
      </section>
    );
  }

  const supabase = await createServerSupabase();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  if (!isAdminUser(user)) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
        <header className="mb-8 border-b border-border pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("gates.forbiddenTitle")}</h1>
              <p className="mt-2 max-w-3xl text-base text-muted-foreground md:text-lg">
                {t("gates.forbiddenSubtitle")}
              </p>
            </div>
          </div>
        </header>
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {t("gates.currentUser")}:{" "}
          <span className="font-medium text-foreground">{user.email ?? user.id}</span>
        </p>
      </section>
    );
  }

  return null;
}
