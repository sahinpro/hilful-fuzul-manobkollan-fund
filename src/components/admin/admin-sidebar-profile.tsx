"use client";

import { LogOut, House } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { createBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

function initials(email: string): string {
  const local = email.split("@")[0] ?? "?";
  return local.slice(0, 2).toUpperCase() || "?";
}

export function AdminSidebarProfile() {
  const { t } = useAdminI18n();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [email, setEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserSupabase();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    if (!isSupabaseConfigured()) return;
    setLoggingOut(true);
    if (isMobile) setOpenMobile(false);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (!email) {
    return null;
  }

  const tooltip = { children: `${t("sidebar.userLabel")}: ${email}` };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={tooltip}
                className="aria-expanded:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg text-xs">{initials(email)}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{t("sidebar.userLabel")}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">{email}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs">{initials(email)}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{t("sidebar.userLabel")}</span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg"
              onClick={() => {
                if (isMobile) setOpenMobile(false);
                router.push("/");
              }}
            >
              <House className="size-4 shrink-0" aria-hidden />
              {t("nav.backToSite")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2 rounded-lg"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              {loggingOut ? t("session.loggingOut") : t("session.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
