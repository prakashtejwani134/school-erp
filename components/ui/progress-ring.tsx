"use client";

import { cn } from "@/lib/utils";

/** Circular SVG progress indicator — --accent stroke, percentage in Fraunces at center. Replaces plain percentage text on the Command Center. */
export function ProgressRing({
  value,
  size = 88,
  strokeWidth = 7,
  label,
  className,
}: {
  /** 0-100. null renders an empty track with "—" instead of a misleading 0%. */
  value: number | null;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = value === null ? 0 : Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn("relative inline-flex shrink-0 flex-col items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {value !== null ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-lg font-medium tabular-nums leading-none">
          {value === null ? "—" : `${Math.round(value)}%`}
        </span>
        {label ? (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
