"use client";

import { KeyRound } from "lucide-react";
import { AdminResetPasswordForm } from "@/components/admin/admin-reset-password-form";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";

export function AdminResetPasswordPageBody() {
  const { t } = useAdminI18n();

  return (
    <section className="mx-auto w-full max-w-md px-1">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner ring-1 ring-primary/25">
          <KeyRound className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {t("resetPassword.pageTitle")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("resetPassword.pageSubtitle")}
        </p>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-card/90 p-1 shadow-xl shadow-primary/10 ring-1 ring-border/80 backdrop-blur-sm">
        <AdminResetPasswordForm />
      </div>
    </section>
  );
}
