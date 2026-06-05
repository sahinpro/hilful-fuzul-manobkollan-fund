"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabase } from "@/lib/supabase/client";

type FormState = { loading: boolean; error: string; ready: boolean; checking: boolean };

export function AdminResetPasswordForm() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<FormState>({
    loading: false,
    error: "",
    ready: false,
    checking: true,
  });

  useEffect(() => {
    const supabase = createBrowserSupabase();

    function markReady() {
      setState((prev) => ({ ...prev, ready: true, checking: false, error: "" }));
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
      else setState((prev) => ({ ...prev, checking: false }));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        markReady();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setState((prev) => ({ ...prev, error: t("resetPassword.tooShort") }));
      return;
    }

    if (password !== confirmPassword) {
      setState((prev) => ({ ...prev, error: t("resetPassword.mismatch") }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      router.replace("/admin/overview");
      router.refresh();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : t("resetPassword.failed"),
      }));
    }
  }

  if (state.checking) {
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{t("resetPassword.verifying")}</p>
        </CardContent>
      </Card>
    );
  }

  if (!state.ready) {
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl">{t("resetPassword.invalidTitle")}</CardTitle>
          <CardDescription>{t("resetPassword.invalidDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button type="button" variant="outline" className="w-full" onClick={() => router.replace("/admin/login")}>
            {t("resetPassword.backToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl">{t("resetPassword.cardTitle")}</CardTitle>
        <CardDescription>{t("resetPassword.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-new-password">{t("resetPassword.newPassword")}</Label>
            <Input
              id="admin-new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-confirm-password">{t("resetPassword.confirmPassword")}</Label>
            <Input
              id="admin-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full sm:min-h-10" disabled={state.loading}>
            {state.loading ? t("resetPassword.submitting") : t("resetPassword.submit")}
          </Button>
          {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
