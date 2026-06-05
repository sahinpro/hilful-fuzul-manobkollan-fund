"use client";

import { ChevronsUpDown, House, LogOut } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

function initials(email: string): string {
  const local = email.split("@")[0] ?? "?";
  return local.slice(0, 2).toUpperCase() || "?";
}

function ProfileIdentity({
  email,
  userLabel,
  emailClassName,
}: {
  email: string;
  userLabel: string;
  emailClassName?: string;
}) {
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarFallback className="rounded-lg text-xs">{initials(email)}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{userLabel}</span>
        <span
          className={cn(
            "truncate text-xs text-sidebar-foreground/70",
            emailClassName,
          )}
        >
          {email}
        </span>
      </div>
    </>
  );
}

function AdminSidebarProfileMobile({
  email,
  userLabel,
}: {
  email: string;
  userLabel: string;
}) {
  const { t } = useAdminI18n();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    if (!isSupabaseConfigured()) return;
    setLoggingOut(true);
    setMobileMenuOpen(false);
    setOpenMobile(false);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  function handleBackToSite() {
    setMobileMenuOpen(false);
    setOpenMobile(false);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          closeOnClick={false}
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-haspopup="menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className={cn(
            mobileMenuOpen && "bg-sidebar-accent text-sidebar-accent-foreground",
          )}
        >
          <ProfileIdentity email={email} userLabel={userLabel} />
          <ChevronsUpDown
            className={cn(
              "ml-auto size-4 shrink-0 transition-transform duration-200",
              mobileMenuOpen && "rotate-180",
            )}
            aria-hidden
          />
        </SidebarMenuButton>

        {mobileMenuOpen ? (
          <div
            role="menu"
            className="mx-1 mb-1 grid gap-1 rounded-xl border border-sidebar-border bg-popover p-1.5 text-popover-foreground shadow-md"
          >
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">
                  {initials(email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userLabel}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
            </div>

            <div className="my-0.5 h-px bg-border" />

            <Link
              href="/"
              role="menuitem"
              onClick={handleBackToSite}
              className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent"
            >
              <House className="size-4 shrink-0" aria-hidden />
              {t("nav.backToSite")}
            </Link>

            <div className="my-0.5 h-px bg-border" />

            <button
              type="button"
              role="menuitem"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 active:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              {loggingOut ? t("session.loggingOut") : t("session.logout")}
            </button>
          </div>
        ) : null}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AdminSidebarProfile() {
  const { t } = useAdminI18n();
  const router = useRouter();
  const { isMobile } = useSidebar();
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
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (!email) {
    return null;
  }

  const userLabel = t("sidebar.userLabel");
  const tooltip = { children: `${userLabel}: ${email}` };

  if (isMobile) {
    return <AdminSidebarProfileMobile email={email} userLabel={userLabel} />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                closeOnClick={false}
                tooltip={tooltip}
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <ProfileIdentity email={email} userLabel={userLabel} />
            <ChevronsUpDown
              className="ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="z-60 min-w-56 rounded-xl"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs">
                      {initials(email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userLabel}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg"
              render={<Link href="/" />}
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
