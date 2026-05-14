"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `YYYY-MM-DDTHH:mm` in local time, compatible with `new Date(s)` parsing. */
export function localDateAndTimeToDatetimeLocal(d: Date, timeHHMM: string): string {
  const [hRaw, mRaw] = timeHHMM.split(":");
  const h = Math.min(23, Math.max(0, Number(hRaw) || 0));
  const m = Math.min(59, Math.max(0, Number(mRaw) || 0));
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(h)}:${pad2(m)}`;
}

/** Calendar date in local time at 00:00 (no separate time field in forms). */
export function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return localDateAndTimeToDatetimeLocal(d, "00:00");
}

function parseDateLocal(valueLocal: string): Date {
  const trimmed = valueLocal.trim();
  const fallback = new Date();
  if (!trimmed) {
    return new Date(
      fallback.getFullYear(),
      fallback.getMonth(),
      fallback.getDate(),
      0,
      0,
      0,
      0,
    );
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) {
    return new Date(
      fallback.getFullYear(),
      fallback.getMonth(),
      fallback.getDate(),
      0,
      0,
      0,
      0,
    );
  }
  return d;
}

export type AdminDatetimePickerProps = {
  id: string;
  label: string;
  valueLocal: string;
  onChange: (nextLocal: string) => void;
  disabled?: boolean;
  /** BCP 47 tag for the calendar button label, e.g. `bn-BD` or `en-GB`. */
  dateLocaleTag: string;
};

export function AdminDatetimePicker({
  id,
  label,
  valueLocal,
  onChange,
  disabled,
  dateLocaleTag,
}: AdminDatetimePickerProps) {
  const selectedDate = parseDateLocal(valueLocal);
  const [open, setOpen] = React.useState(false);

  const dateLabel = selectedDate.toLocaleDateString(dateLocaleTag, {
    dateStyle: "medium",
  });

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-9 w-full min-w-0 justify-start gap-2 px-3 text-left font-normal sm:min-h-10",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate" lang={dateLocaleTag}>
            {dateLabel}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (!d || disabled) return;
              onChange(localDateAndTimeToDatetimeLocal(d, "00:00"));
              setOpen(false);
            }}
            defaultMonth={selectedDate}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
