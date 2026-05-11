import { PageShell } from "@/components/page-shell";

export const dynamic = "force-dynamic";

type ReceiptPageProps = {
  params: Promise<{ receiptNo: string }>;
};

export default async function ReceiptVerifyPage(props: ReceiptPageProps) {
  const { receiptNo } = await props.params;

  return (
    <PageShell
      title="রসিদ যাচাই"
      subtitle="এই পেইজে রসিদ নম্বর অনুযায়ী দানের তথ্য যাচাই করা যাবে।"
    >
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">রসিদ নম্বর</p>
        <p className="mt-1 text-xl font-bold">{receiptNo}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          লাইভ Supabase সংযুক্তির পর এখানে দাতার নাম, তারিখ, পরিমাণ এবং PDF রসিদ লিংক প্রদর্শিত হবে।
        </p>
      </div>
    </PageShell>
  );
}
