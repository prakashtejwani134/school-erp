"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fades + slides route content in/out on navigation. Wrap the shell's main content once. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
