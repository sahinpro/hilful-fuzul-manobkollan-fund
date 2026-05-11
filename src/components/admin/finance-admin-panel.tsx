"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ApiState = {
  loading: boolean;
  ok: boolean | null;
  message: string;
};

type FinanceAdminPanelProps = {
  userEmail: string;
};

const initState: ApiState = { loading: false, ok: null, message: "" };

async function postJson(path: string, payload: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof json?.error === "string"
        ? json.error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

export function FinanceAdminPanel({ userEmail }: FinanceAdminPanelProps) {
  const router = useRouter();

  const [donationState, setDonationState] = useState<ApiState>(initState);
  const [expenseState, setExpenseState] = useState<ApiState>(initState);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [donation, setDonation] = useState({
    donorName: "",
    amount: "",
    method: "cash",
    note: "",
    published: true,
  });

  const [expense, setExpense] = useState({
    category: "চিকিৎসা",
    amount: "",
    description: "",
    beneficiary: "",
    published: true,
  });

  async function handleLogout() {
    setLogoutLoading(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  async function handleDonationSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDonationState({ loading: true, ok: null, message: "Submitting..." });

    const payload: Record<string, unknown> = {
      amount_bdt: Number(donation.amount),
      payment_method: donation.method,
      reference_note: donation.note || null,
      is_published: donation.published,
    };
    if (donation.donorName.trim()) {
      payload.donor = { full_name: donation.donorName.trim() };
    }

    try {
      const res = await postJson("/api/admin/donations", payload);
      setDonationState({
        loading: false,
        ok: true,
        message: `Success: donation id ${res?.donation?.id ?? "created"}`,
      });
      setDonation((prev) => ({ ...prev, amount: "", note: "" }));
    } catch (err) {
      setDonationState({
        loading: false,
        ok: false,
        message: err instanceof Error ? err.message : "Failed",
      });
    }
  }

  async function handleExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setExpenseState({ loading: true, ok: null, message: "Submitting..." });

    try {
      const res = await postJson("/api/admin/expenses", {
        category: expense.category,
        amount_bdt: Number(expense.amount),
        description: expense.description,
        beneficiary_note: expense.beneficiary || null,
        is_published: expense.published,
      });
      setExpenseState({
        loading: false,
        ok: true,
        message: `Success: expense id ${res?.expense?.id ?? "created"}`,
      });
      setExpense((prev) => ({
        ...prev,
        amount: "",
        description: "",
        beneficiary: "",
      }));
    } catch (err) {
      setExpenseState({
        loading: false,
        ok: false,
        message: err instanceof Error ? err.message : "Failed",
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>লগইন সেশন</CardTitle>
            <CardDescription>বর্তমান ইউজার: {userEmail}</CardDescription>
          </div>
          <Button variant="outline" onClick={handleLogout} disabled={logoutLoading}>
            {logoutLoading ? "লগআউট..." : "লগআউট"}
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>দান যোগ করুন</CardTitle>
            <CardDescription>এই ফর্ম `/api/admin/donations` এ POST করে।</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleDonationSubmit}>
              <div className="space-y-2">
                <Label htmlFor="donor">দাতার নাম (optional)</Label>
                <Input
                  id="donor"
                  value={donation.donorName}
                  onChange={(e) =>
                    setDonation((p) => ({ ...p, donorName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damount">পরিমাণ (BDT)</Label>
                <Input
                  id="damount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={donation.amount}
                  onChange={(e) =>
                    setDonation((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dmethod">পেমেন্ট মেথড</Label>
                <Input
                  id="dmethod"
                  value={donation.method}
                  onChange={(e) =>
                    setDonation((p) => ({ ...p, method: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dnote">নোট</Label>
                <Textarea
                  id="dnote"
                  value={donation.note}
                  onChange={(e) =>
                    setDonation((p) => ({ ...p, note: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={donation.published}
                  onChange={(e) =>
                    setDonation((p) => ({ ...p, published: e.target.checked }))
                  }
                />
                Public এ দেখাবো
              </label>
              <Button type="submit" disabled={donationState.loading}>
                {donationState.loading ? "Submitting..." : "Donation Save"}
              </Button>
              {donationState.message ? (
                <p
                  className={`text-sm ${
                    donationState.ok ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {donationState.message}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ব্যয় যোগ করুন</CardTitle>
            <CardDescription>এই ফর্ম `/api/admin/expenses` এ POST করে।</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleExpenseSubmit}>
              <div className="space-y-2">
                <Label htmlFor="ecategory">ক্যাটাগরি</Label>
                <Input
                  id="ecategory"
                  value={expense.category}
                  onChange={(e) =>
                    setExpense((p) => ({ ...p, category: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eamount">পরিমাণ (BDT)</Label>
                <Input
                  id="eamount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={expense.amount}
                  onChange={(e) =>
                    setExpense((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edesc">বিবরণ</Label>
                <Textarea
                  id="edesc"
                  required
                  value={expense.description}
                  onChange={(e) =>
                    setExpense((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ebeneficiary">Beneficiary note</Label>
                <Input
                  id="ebeneficiary"
                  value={expense.beneficiary}
                  onChange={(e) =>
                    setExpense((p) => ({ ...p, beneficiary: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={expense.published}
                  onChange={(e) =>
                    setExpense((p) => ({ ...p, published: e.target.checked }))
                  }
                />
                Public এ দেখাবো
              </label>
              <Button type="submit" disabled={expenseState.loading}>
                {expenseState.loading ? "Submitting..." : "Expense Save"}
              </Button>
              {expenseState.message ? (
                <p
                  className={`text-sm ${
                    expenseState.ok ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {expenseState.message}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
