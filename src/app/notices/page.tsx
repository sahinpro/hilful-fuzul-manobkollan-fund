import { Megaphone } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export default function NoticePage() {
  return (
    <PageShell
      icon={Megaphone}
      title="নোটিশ"
      subtitle="সভা, কার্যক্রম ও গুরুত্বপূর্ণ প্রশাসনিক আপডেট এখানে প্রকাশিত হবে।"
    >
      <ul className="space-y-3">
        <li className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span>এখনো কোনো নোটিশ প্রকাশিত হয়নি।</span>
        </li>
      </ul>
    </PageShell>
  );
}
