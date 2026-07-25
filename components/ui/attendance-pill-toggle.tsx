"use client";

import { motion } from "framer-motion";
import type { AttendanceStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "LEAVE", label: "Leave" },
];

const ACTIVE_TEXT: Record<AttendanceStatus, string> = {
  PRESENT: "text-emerald-700 dark:text-emerald-400",
  ABSENT: "text-red-700 dark:text-red-400",
  LATE: "text-amber-700 dark:text-amber-400",
  LEAVE: "text-blue-700 dark:text-blue-400",
};

const ACTIVE_PILL: Record<AttendanceStatus, string> = {
  PRESENT: "bg-emerald-500/15",
  ABSENT: "bg-red-500/15",
  LATE: "bg-amber-500/15",
  LEAVE: "bg-blue-500/15",
};

/**
 * 4-way segmented control for attendance status. `groupId` must be unique
 * per independent toggle instance (e.g. the student's id) — framer-motion
 * matches the sliding pill across renders by `layoutId`, so two toggles
 * sharing an id would animate their pills into each other.
 */
export function AttendancePillToggle({
  value,
  onChange,
  groupId,
}: {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  groupId: string;
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex items-center gap-0.5 rounded-full border bg-muted/40 p-1"
    >
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? ACTIVE_TEXT[opt.value]
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive ? (
              <motion.span
                layoutId={`attendance-pill-${groupId}`}
                className={cn(
                  "absolute inset-0 rounded-full",
                  ACTIVE_PILL[opt.value],
                )}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            ) : null}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
