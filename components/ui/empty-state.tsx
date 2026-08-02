import { cn } from "@/lib/utils";

/**
 * Hand-drawn line-art "empty tray" — the one illustration reused across
 * every empty state in the app (no external illustration library, per the
 * design brief). Deliberately simple: an in-tray with nothing in it, in
 * the same spirit as the "Registrar" ledger/office aesthetic.
 */
function EmptyTrayIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" className="fill-muted" />
      <path
        d="M12 33 L21 16 H43 L52 33"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 33 V44 A4 4 0 0 0 16 48 H48 A4 4 0 0 0 52 44 V33"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 33 H24 A4 4 0 0 1 27.5 35.3 A3 3 0 0 0 30.3 37 H33.7 A3 3 0 0 0 36.5 35.3 A4 4 0 0 1 40 33 H52"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The one empty-state pattern reused everywhere (per the design brief:
 * establish one shape, don't make every empty state look different).
 * `compact` fits inside a table row / tight card panel — icon and text
 * sit side by side instead of stacked with generous padding.
 */
export function EmptyState({
  title,
  description,
  action,
  compact = false,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div className={cn("flex items-center justify-center gap-3 py-2 text-center", className)}>
        <EmptyTrayIllustration className="size-8 shrink-0 text-muted-foreground/50" />
        <div className="flex flex-col items-start text-left">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="ml-1">{action}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-center",
        className,
      )}
    >
      <EmptyTrayIllustration className="size-14 text-muted-foreground/50" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
