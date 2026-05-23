import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

type PublicDataLoadingProps = {
  className?: string;
  compact?: boolean;
};

/** Brand logo pulse used while public finance data streams in. */
export function PublicDataLoading({ className, compact }: PublicDataLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-6" : "py-10",
        className,
      )}
      aria-hidden
    >
      <div className="relative overflow-hidden rounded-2xl bg-primary/5 p-3">
        <Image
          src={siteConfig.logoSrc}
          alt=""
          width={compact ? 40 : 52}
          height={compact ? 40 : 52}
          className="opacity-50 animate-pulse"
        />
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-background/30 to-transparent" />
      </div>
      {!compact ? (
        <>
          <Skeleton className="h-2 w-28" />
          <Skeleton className="h-2 w-20" />
        </>
      ) : null}
    </div>
  );
}
