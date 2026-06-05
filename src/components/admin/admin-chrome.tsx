"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminAppSidebar } from "@/components/admin/admin-app-sidebar";
import { AdminDashboardShellHeader } from "@/components/admin/admin-dashboard-shell-header";
import { AdminLanguageSwitcher } from "@/components/admin/admin-language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const sidebarShellStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  /** Aligns top app header and sidebar brand row (60px). */
  "--header-height": "60px",
} as CSSProperties;

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/reset-password";

  if (isAuthPage) {
    return (
      <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% -15%, hsl(var(--primary) / 0.28), transparent 58%), radial-gradient(ellipse 70% 45% at 100% 0%, hsl(var(--primary) / 0.14), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 100%, hsl(var(--primary) / 0.1), transparent 55%)",
          }}
        />
        <div className="relative border-b border-border/80 bg-muted/25 backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-end gap-4 px-4 sm:px-6">
            <ThemeToggle />
            <AdminLanguageSwitcher />
          </div>
        </div>
        <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-7xl items-center justify-center px-4 py-12 md:py-16">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SidebarProvider defaultOpen style={sidebarShellStyle}>
        <AdminAppSidebar variant="inset" />
        <SidebarInset className="overflow-x-hidden">
          <AdminDashboardShellHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col">
              <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-4 md:gap-8 md:px-6 md:py-6 lg:px-8">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
