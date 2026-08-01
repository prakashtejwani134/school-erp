"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  accent: "border-primary text-primary",
  brass: "border-brass text-brass",
} as const;

/**
 * Official-seal badge for verified/approved/published states — director
 * approvals, published results, verified ID cards. Reserve for a handful of
 * real moments; not a general-purpose status badge (use `Badge` for that).
 */
export function SealBadge({
  label,
  variant = "accent",
  size = 56,
  className,
}: {
  label: string;
  variant?: keyof typeof VARIANT_STYLES;
  size?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ rotate: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 p-1",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      <span
        className={cn(
          "flex size-full flex-col items-center justify-center gap-0.5 rounded-full border border-dashed text-center leading-none",
          variant === "brass" ? "border-brass/50" : "border-primary/50",
        )}
      >
        <Check className="size-3.5" strokeWidth={2.5} />
        <span className="font-heading text-[8px] font-medium uppercase tracking-wide px-1">
          {label}
        </span>
      </span>
    </motion.div>
  );
}
