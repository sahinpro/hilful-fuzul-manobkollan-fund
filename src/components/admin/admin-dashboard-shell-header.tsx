"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminLanguageSwitcher } from "@/components/admin/admin-language-switcher";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

function breadcrumbNavKey(pathname: string | null): string | null {
  if (!pathname) return null;
  if (pathname === "/admin" || pathname === "/admin/overview") return "nav.overview";
  if (pathname === "/admin/donations") return "nav.donations";
  if (pathname === "/admin/expenses") return "nav.expenses";
  if (pathname === "/admin/records") return "nav.records";
  if (pathname === "/admin/advisors") return "nav.advisors";
  if (pathname === "/admin/executive-members") return "nav.executiveMembers";
  return null;
}

export function AdminDashboardShellHeader() {
  const pathname = usePathname();
  const { t } = useAdminI18n();
  const navKey = breadcrumbNavKey(pathname);
  const pageLabel = navKey ? t(navKey) : t("breadcrumb.finance");

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 transition-[width,height] ease-linear">
      <div className="flex w-full min-w-0 items-center gap-2 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="mx-0.5 hidden h-4 shrink-0 sm:block" />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem className="hidden md:block">
                <span className="text-muted-foreground">{t("breadcrumb.admin")}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate">{pageLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <AdminLanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
