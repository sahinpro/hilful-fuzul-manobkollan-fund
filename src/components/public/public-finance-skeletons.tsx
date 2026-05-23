import { PublicDataLoading } from "@/components/public/public-data-loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PublicStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="ios-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-10 rounded-xl" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-full max-w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PublicChartsSkeleton() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </CardHeader>
          <CardContent>
            <div className="relative flex h-[250px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/20">
              <PublicDataLoading compact />
              <Skeleton className="absolute inset-x-6 bottom-6 h-24 rounded-md opacity-40" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PublicLedgerSkeleton() {
  return (
    <div className="ios-card overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-4 gap-4 bg-muted px-4 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
      <div className="space-y-3 border-t border-border px-4 py-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
