import { PageShell } from "@/components/page-shell";
import { siteImages } from "@/config/images";
import { BookOpen, Users } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <PageShell
      icon={Users}
      title="আমাদের সম্পর্কে"
      subtitle="এই পেইজে সংগঠনের লক্ষ্য, দৃষ্টিভঙ্গি, পরিচালনা নীতি এবং সমাজ উন্নয়নের মূল অঙ্গীকার উপস্থাপন করা হবে।"
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-4/3 min-h-[200px] overflow-hidden rounded-xl border border-border">
          <Image
            src={siteImages.bannerNature}
            alt="প্রকৃতি ও সম্প্রদায় কল্যাণ — প্রতীকী চিত্র"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground md:text-base">
          <div className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden />
            <span className="font-semibold">বার্তা</span>
          </div>
          <p>
            কনটেন্ট স্ট্রাকচার প্রস্তুত আছে। পরবর্তী ধাপে এখানে যাচাইকৃত প্রাতিষ্ঠানিক তথ্য, পরিচালনা
            কাঠামো, উপদেষ্টা কমিটি এবং সংগঠনের ইতিহাস যুক্ত করা হবে।
          </p>
        </div>
      </div>
    </PageShell>
  );
}
