"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * A small comet that races around the card's border on hover. Relies on
 * `offset-path: rect()` (Chromium); on browsers without support it simply
 * stays invisible — the glass styling below still works everywhere.
 */
function BorderBeam({ duration = 7 }: { duration?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
      <motion.div
        className="absolute aspect-square w-16 rounded-full bg-gradient-to-l from-primary via-primary/50 to-transparent"
        style={{ offsetPath: "rect(0px auto auto 0px round 9999px)" }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/**
 * Glassmorphic card shell: translucent blurred background, subtle border,
 * an ambient glow, and an animated border beam — all revealed on hover.
 * Drop-in replacement for `Card` (sets the same `--card-spacing` variable,
 * so `CardHeader`/`CardContent`/`CardFooter` etc. still work inside it).
 */
export function GlassCard({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/60 text-sm text-card-foreground shadow-sm ring-1 ring-foreground/10 backdrop-blur-md [--card-spacing:--spacing(4)]",
        "dark:border-white/10 dark:bg-white/[0.04]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--primary), transparent 88%), transparent 70%)",
        }}
      />
      <BorderBeam />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </motion.div>
  );
}
