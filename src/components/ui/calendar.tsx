"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

export type CalendarProps = DayPickerProps;

function Calendar({ className, classNames, showOutsideDays = true, components, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-sm [--rdp-accent-color:var(--color-primary)] [--rdp-accent-background-color:color-mix(in_oklab,var(--color-primary)_18%,transparent)] [--rdp-outside-opacity:0.55] [--rdp-today-color:var(--color-primary)]",
        className,
      )}
      classNames={{
        root: cn("w-fit", classNames?.root),
        months: cn("flex flex-col gap-3 sm:flex-row", classNames?.months),
        month: cn("flex flex-col gap-3", classNames?.month),
        month_caption: cn("relative flex h-8 items-center justify-center px-8", classNames?.month_caption),
        caption_label: cn("text-sm font-medium", classNames?.caption_label),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between px-0.5", classNames?.nav),
        button_previous: cn(
          "inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-sm transition hover:bg-muted",
          classNames?.button_previous,
        ),
        button_next: cn(
          "inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-sm transition hover:bg-muted",
          classNames?.button_next,
        ),
        month_grid: cn("mt-2 w-full border-collapse", classNames?.month_grid),
        weekdays: cn("flex", classNames?.weekdays),
        weekday: cn("w-8 text-center text-[0.8rem] font-normal text-muted-foreground", classNames?.weekday),
        week: cn("mt-1 flex w-full", classNames?.week),
        day: cn(
          "relative flex h-8 w-8 items-center justify-center p-0 text-center text-sm focus-within:relative focus-within:z-10",
          classNames?.day,
        ),
        day_button: cn(
          "inline-flex size-8 cursor-pointer items-center justify-center rounded-md font-normal transition hover:bg-muted aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground",
          classNames?.day_button,
        ),
        selected: cn("rounded-md", classNames?.selected),
        today: cn("font-semibold text-primary", classNames?.today),
        outside: cn("text-muted-foreground", classNames?.outside),
        disabled: cn("pointer-events-none text-muted-foreground opacity-40", classNames?.disabled),
        hidden: cn("invisible", classNames?.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClass, orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", chevronClass)} {...chevronProps} />
          ) : (
            <ChevronRight className={cn("size-4", chevronClass)} {...chevronProps} />
          ),
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
