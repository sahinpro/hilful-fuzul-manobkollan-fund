import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  children: ReactNode;
};

export function PageShell({ title, subtitle, icon: Icon, children }: PageShellProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
      <header className="mb-8 border-b border-border pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          {Icon ? (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-base text-muted-foreground md:text-lg">{subtitle}</p>
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}
