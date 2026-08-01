"use client";

import {
  CalendarCheck,
  IndianRupee,
  ReceiptText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";
import { formatINR } from "@/lib/currency";

const STAT_ICONS = {
  users: Users,
  "indian-rupee": IndianRupee,
  "receipt-text": ReceiptText,
  "calendar-check": CalendarCheck,
} as const satisfies Record<string, LucideIcon>;

export type StatIconName = keyof typeof STAT_ICONS;

// Server Components can't pass functions as props to Client Components like
// this one, so callers pass a serializable format *name* instead of a
// formatter function, and the actual formatter is resolved here.
const STAT_FORMATTERS = {
  integer: (n: number) => Math.round(n).toLocaleString("en-IN"),
  currency: (n: number) => formatINR(n),
  percent: (n: number) => `${Math.round(n)}%`,
} as const satisfies Record<string, (value: number) => string>;

export type StatFormat = keyof typeof STAT_FORMATTERS;

export function StatCard({
  label,
  value,
  format = "integer",
  footer,
  icon,
  trend,
}: {
  label: string;
  value: number;
  format?: StatFormat;
  footer: string;
  icon: StatIconName;
  /** Optional trend series (e.g. last 6 months) rendered as an inline sparkline. */
  trend?: number[];
}) {
  const Icon = STAT_ICONS[icon];
  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Card className="h-full transition-shadow duration-300 hover:shadow-md">
        <CardHeader>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <AnimatedCounter value={value} format={STAT_FORMATTERS[format]} />
          </CardTitle>
          <CardAction>
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
              <Icon className="size-4" />
            </div>
          </CardAction>
        </CardHeader>
        {trend && trend.length >= 2 ? (
          <div className="px-(--card-spacing)">
            <Sparkline data={trend} />
          </div>
        ) : null}
        <CardFooter>
          <p className="text-xs text-muted-foreground">{footer}</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
