"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabase } from "@/lib/supabase/client";

type FormState = { loading: boolean; error: string };

export function AdminLoginForm() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<FormState>({ loading: false, error: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ loading: true, error: "" });

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setState({ loading: false, error: error.message });
        return;
      }
      router.replace("/admin/overview");
      router.refresh();
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : t("login.failed"),
      });
    }
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl">{t("login.cardTitle")}</CardTitle>
        <CardDescription>{t("login.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">{t("login.email")}</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">{t("login.password")}</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full sm:min-h-10" disabled={state.loading}>
            {state.loading ? t("login.submitting") : t("login.submit")}
          </Button>
          {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
