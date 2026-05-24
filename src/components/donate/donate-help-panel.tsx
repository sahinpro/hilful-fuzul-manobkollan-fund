"use client";

import { useSiteI18n } from "@/components/site-i18n-provider";
import { siteConfig } from "@/config/site";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Smartphone,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type DonateHelpPanelProps = {
  mode: "donate" | "claim";
};

const STEP_ICONS = [Wallet, Smartphone, ClipboardList, CheckCircle2] as const;

export function DonateHelpPanel({ mode }: DonateHelpPanelProps) {
  const { t } = useSiteI18n();
  const prefix =
    mode === "claim" ? "pages.donate.help.claim" : "pages.donate.help";

  const stepKeys = ["send", "copy", "fill", "verify"] as const;

  return (
    <aside className="ios-card space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8 lg:sticky lg:top-24 lg:self-start">
      <div>
        <h2 className="text-lg font-bold md:text-xl">{t(`${prefix}.title`)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(`${prefix}.intro`)}
        </p>
      </div>

      <ol className="space-y-4">
        {stepKeys.map((key, index) => {
          const Icon = STEP_ICONS[index]!;
          return (
            <li key={key} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  <span className="text-primary">{index + 1}.</span>{" "}
                  {t(`${prefix}.steps.${key}.title`)}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`${prefix}.steps.${key}.body`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <Image
          src={siteConfig.paymentBanner.src}
          alt={t("footer.paymentTitle")}
          width={200}
          height={62}
          className="h-auto max-w-full object-contain opacity-90"
          unoptimized
        />
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
        <p className="text-sm font-semibold">
          {t("pages.donate.help.tipsTitle")}
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
          <li>{t("pages.donate.help.tips.sendMoney")}</li>
          <li>{t("pages.donate.help.tips.trxMatch")}</li>
          <li>{t("pages.donate.help.tips.privacy")}</li>
        </ul>
      </div>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <Eye className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          {t("pages.donate.help.transparencyLead")}{" "}
          <Link
            href="/transparency"
            className="font-medium text-primary hover:underline"
          >
            {t("pages.donate.help.transparencyLink")}
          </Link>
        </span>
      </p>
    </aside>
  );
}
