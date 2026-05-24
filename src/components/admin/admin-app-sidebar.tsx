"use client";

import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { AdminSidebarProfile } from "@/components/admin/admin-sidebar-profile";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getSiteLocaleText, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  Award,
  Briefcase,
  CircleDollarSign,
  LayoutDashboard,
  Receipt,
  Search,
  Table2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentProps } from "react";

const NAV_LINKS = [
  { href: "/admin/overview", key: "nav.overview", Icon: LayoutDashboard },
  { href: "/admin/donations", key: "nav.donations", Icon: CircleDollarSign },
  { href: "/admin/expenses", key: "nav.expenses", Icon: Receipt },
  { href: "/admin/records", key: "nav.records", Icon: Table2 },
  { href: "/admin/advisors", key: "nav.advisors", Icon: Award },
  { href: "/admin/executive-members", key: "nav.executiveMembers", Icon: Briefcase },
] as const;

const navButtonClassName =
  "h-10 min-h-10 gap-3 px-3 py-2 transition-colors hover:bg-sidebar-accent/90 " +
  "data-active:bg-primary data-active:text-primary-foreground " +
  "data-active:hover:bg-primary data-active:hover:text-primary-foreground " +
  "data-active:shadow-sm";

export function AdminAppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { locale, t } = useAdminI18n();
  const siteText = getSiteLocaleText(locale);
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex h-(--header-height) shrink-0 flex-row items-center gap-2 border-b border-border px-2 py-0">
        <SidebarMenu className="min-h-0 flex-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="default"
              tooltip={siteText.shortName}
              className={cn(
                "h-10 min-h-10 gap-3 px-2 py-2 transition-colors hover:bg-sidebar-accent/90",
                "data-[slot=sidebar-menu-button]:px-2!",
              )}
              render={<Link href="/admin/overview" />}
            >
              <span className="relative flex size-12 shrink-0 overflow-hidden rounded-lg bg-sidebar-primary/25 ring-sidebar-border">
                {logoFailed ? (
                  <span className="flex size-full items-center justify-center bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                    HF
                  </span>
                ) : (
                  <Image
                    src={siteConfig.logoSrc}
                    alt={t("brand.shortTitle")}
                    width={48}
                    height={48}
                    className="object-contain p-0.5"
                    priority
                    onError={() => setLogoFailed(true)}
                  />
                )}
              </span>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {t("brand.shortTitle")}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {siteText.shortName}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="gap-2 p-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="relative">
              <Search
                className="pointer-events-none absolute inset-s-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                readOnly
                tabIndex={-1}
                placeholder={t("sidebar.searchPlaceholder")}
                className="h-9 bg-sidebar-accent/40 ps-8 text-sidebar-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <SidebarGroupLabel className="px-0">
            {t("navGroup.main")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-0">
            <SidebarMenu className="gap-1">
              {NAV_LINKS.map(({ href, key, Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    tooltip={t(key)}
                    isActive={pathname === href}
                    className={navButtonClassName}
                    render={<Link href={href} />}
                  >
                    <Icon aria-hidden className="shrink-0" />
                    <span>{t(key)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border">
        <SidebarGroupLabel>{t("navGroup.footer")}</SidebarGroupLabel>
        <AdminSidebarProfile />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
