import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { FinanceAdminPanel } from "@/components/admin/finance-admin-panel";
import { PageShell } from "@/components/page-shell";
import { isAdminUser } from "@/lib/admin/auth";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell
        icon={LockKeyhole}
        title="অ্যাডমিন প্যানেল"
        subtitle="Supabase env সেট না থাকায় লগইন সক্রিয় হয়নি।"
      >
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          `.env` এ `NEXT_PUBLIC_SUPABASE_URL` এবং `NEXT_PUBLIC_SUPABASE_ANON_KEY` সেট করুন।
        </p>
      </PageShell>
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
      <PageShell
        icon={LockKeyhole}
        title="অ্যাক্সেস নিষিদ্ধ"
        subtitle="এই প্যানেলে প্রবেশ করতে Supabase user এর `app_metadata.role = admin` হতে হবে।"
      >
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          বর্তমান ইউজার: <span className="font-medium text-foreground">{user.email ?? user.id}</span>
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      icon={LockKeyhole}
      title="অ্যাডমিন ফাইন্যান্স প্যানেল"
      subtitle="Supabase admin role দিয়ে লগইন করা অবস্থায় দান/ব্যয় এন্ট্রি দিন।"
    >
      <FinanceAdminPanel userEmail={user.email ?? "admin"} />
    </PageShell>
  );
}
