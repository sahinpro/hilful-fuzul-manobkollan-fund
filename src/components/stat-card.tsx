import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
  className?: string;
};

export function StatCard({ title, value, note, icon: Icon, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "shadow-sm transition-[transform,box-shadow] duration-200 ease-spring motion-safe:active:scale-[0.99] hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        <CardDescription className="mt-1.5">{note}</CardDescription>
      </CardContent>
    </Card>
  );
}
