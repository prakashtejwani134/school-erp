"use client";

import { motion, type Variants } from "framer-motion";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const bodyVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Drop-in replacement for `TableBody` that staggers `AnimatedTableRow` children in on mount. */
export function AnimatedTableBody({
  className,
  ...props
}: ComponentProps<typeof motion.tbody>) {
  return (
    <motion.tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      initial="hidden"
      animate="visible"
      variants={bodyVariants}
      {...props}
    />
  );
}

/** Drop-in replacement for `TableRow` with a staggered entrance, a subtle hover slide, and — for clickable rows — a press-down tap cue. */
export function AnimatedTableRow({
  className,
  onClick,
  ...props
}: ComponentProps<typeof motion.tr>) {
  return (
    <motion.tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      variants={rowVariants}
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={onClick ? { scale: 0.995 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...props}
    />
  );
}
