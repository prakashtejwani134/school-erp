"use client";

import * as React from "react";
import { animate, useInView, useMotionValue } from "framer-motion";

/**
 * Animates a numeric value from 0 to `value` once it scrolls into view.
 * `format` receives the in-progress number on every tick, so pass a
 * formatter (currency, thousands separators, a trailing "%", ...) rather
 * than pre-formatting `value` yourself.
 */
export function AnimatedCounter({
  value,
  format = (n) => Math.round(n).toLocaleString("en-IN"),
  duration = 1,
  className,
}: {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = React.useState(() => format(0));

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [inView, value, duration, motionValue]);

  React.useEffect(() => {
    return motionValue.on("change", (latest) => setDisplay(format(latest)));
  }, [motionValue, format]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
