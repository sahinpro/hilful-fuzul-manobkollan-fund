"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-md border border-border bg-card" aria-hidden />;
  }

  const current = theme === "system" ? `সিস্টেম (${resolvedTheme === "dark" ? "ডার্ক" : "লাইট"})` : theme === "dark" ? "ডার্ক" : "লাইট";

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">থিম বেছে নিন</span>
        {resolvedTheme === "dark" ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
        <span className="hidden text-xs sm:inline">{current}</span>
      </Button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="মেনু বন্ধ করুন"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-card p-1 text-card-foreground shadow-md"
          >
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                theme === "light" && "bg-accent",
              )}
              onClick={() => {
                setTheme("light");
                setOpen(false);
              }}
            >
              <Sun className="size-4 shrink-0" aria-hidden />
              লাইট
            </button>
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                theme === "dark" && "bg-accent",
              )}
              onClick={() => {
                setTheme("dark");
                setOpen(false);
              }}
            >
              <Moon className="size-4 shrink-0" aria-hidden />
              ডার্ক
            </button>
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                theme === "system" && "bg-accent",
              )}
              onClick={() => {
                setTheme("system");
                setOpen(false);
              }}
            >
              <Monitor className="size-4 shrink-0" aria-hidden />
              সিস্টেম
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
