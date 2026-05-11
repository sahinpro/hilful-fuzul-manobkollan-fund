import { FileSpreadsheet } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export default function AnnualReportPage() {
  return (
    <PageShell
      icon={FileSpreadsheet}
      title="বার্ষিক প্রতিবেদন"
      subtitle="বছরভিত্তিক আয়-ব্যয়, কার্যক্রম ফলাফল এবং নথিপত্র ডাউনলোড এখানে পাওয়া যাবে।"
    >
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">২০২৬ প্রতিবেদন</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          প্রতিবেদন প্রকাশের পর এখানে সারাংশ, ডাউনলোড লিংক এবং ভিজ্যুয়াল বিশ্লেষণ যুক্ত হবে।
        </p>
      </div>
    </PageShell>
  );
}
