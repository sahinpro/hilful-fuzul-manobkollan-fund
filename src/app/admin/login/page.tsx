import { LogIn } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { PageShell } from "@/components/page-shell";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <PageShell
      icon={LogIn}
      title="অ্যাডমিন লগইন"
      subtitle="Supabase admin user দিয়ে লগইন করুন।"
    >
      <AdminLoginForm />
    </PageShell>
  );
}
