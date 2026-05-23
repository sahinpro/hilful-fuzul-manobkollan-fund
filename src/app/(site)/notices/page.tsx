import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { Megaphone } from "lucide-react";

export default async function NoticePage() {
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      icon={<Megaphone className="size-6" aria-hidden />}
      title={t("pages.notices.title")}
      subtitle={t("pages.notices.subtitle")}
    >
      <PageSection>
        <ul className="space-y-3">
          <li className="ios-card flex items-start gap-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            <Megaphone
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <span>{t("pages.notices.empty")}</span>
          </li>
        </ul>
      </PageSection>
    </PageShell>
  );
}
