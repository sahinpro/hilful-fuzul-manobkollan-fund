"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = { loading: boolean; error: string };

export function AdminLoginForm() {
  const router = useRouter();
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
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : "Login failed",
      });
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>লগইন ফর্ম</CardTitle>
        <CardDescription>Supabase Authentication ব্যবহার করে অ্যাডমিন লগইন করুন।</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
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
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={state.loading}>
            {state.loading ? "লগইন হচ্ছে..." : "লগইন"}
          </Button>
          {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
