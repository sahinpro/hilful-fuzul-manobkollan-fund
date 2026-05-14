"use client";

import { siteConfig } from "@/config/site";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const { t } = useSiteI18n();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="flex flex-col items-start gap-4">
          <Link
            href="/"
            className="flex flex-col items-start gap-3 transition-opacity hover:opacity-90"
          >
            <Image
              src={siteConfig.logoSrc}
              alt={t("site.logoAlt")}
              width={72}
              height={72}
              className="h-16 w-16 object-contain"
              unoptimized
            />
            <div className="text-left">
              <h3 className="text-lg font-semibold leading-snug">{t("site.fullName")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{siteConfig.location}</p>
            </div>
          </Link>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{t("footer.quickLinksTitle")}</h4>
          <div className="grid gap-1">
            {siteConfig.footerQuickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{t("footer.contactTitle")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">{t("footer.phoneLabel")}: </span>
                {siteConfig.contact.phone}
              </span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">{t("footer.emailLabel")}: </span>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="underline-offset-2 hover:underline"
                >
                  {siteConfig.contact.email}
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">{t("footer.addressLabel")}: </span>
                {siteConfig.contact.addressLines}
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold">{t("footer.paymentTitle")}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{t("footer.paymentNote")}</p>
            <div className="mt-3">
              <Image
                src={siteConfig.paymentBanner.src}
                alt={siteConfig.paymentBanner.alt}
                width={siteConfig.paymentBanner.width}
                height={siteConfig.paymentBanner.height}
                className="h-auto w-full max-w-sm object-contain object-left"
                unoptimized
              />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <h4 className="text-xs font-semibold text-foreground">{t("footer.systemNoteTitle")}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{t("footer.systemNoteBody")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
