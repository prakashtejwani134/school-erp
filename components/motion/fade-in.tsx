"use client";

import { motion, type Variants } from "framer-motion";
import type { ComponentProps } from "react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

/** Stagger container — pair with `FadeInItem` children for a cascading entrance. */
export function FadeInStagger({
  className,
  ...props
}: ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      {...props}
    />
  );
}

/** One item in a `FadeInStagger` group; inherits the parent's animate state. */
export function FadeInItem({
  className,
  ...props
}: ComponentProps<typeof motion.div>) {
  return <motion.div className={className} variants={itemVariants} {...props} />;
}

/** Self-contained fade + slide-up entrance for a single block (e.g. a whole page). */
export function PageFadeIn({
  className,
  ...props
}: ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      {...props}
    />
  );
}
