import { BookOpen, Building2, HeartHandshake, LayoutList, Stethoscope } from "lucide-react";
import { PageShell } from "@/components/page-shell";

const activityBuckets = [
  { title: "ধর্মীয় শিক্ষা", icon: BookOpen },
  { title: "আর্থিক সহায়তা", icon: HeartHandshake },
  { title: "চিকিৎসা সহায়তা", icon: Stethoscope },
  { title: "সমাজ উন্নয়ন", icon: Building2 },
] as const;

export default function ActivitiesPage() {
  return (
    <PageShell
      icon={LayoutList}
      title="কার্যক্রম"
      subtitle="সংগঠনের চলমান ও পরিকল্পিত কার্যক্রম এই অংশে প্রকাশিত হবে।"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {activityBuckets.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="text-lg font-semibold">{item.title}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                এই ক্যাটাগরির অধীনে নির্দিষ্ট কার্যক্রম, বাজেট বরাদ্দ এবং অগ্রগতির তথ্য যুক্ত হবে।
              </p>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
