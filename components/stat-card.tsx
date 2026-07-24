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

const STAT_ICONS = {
  users: Users,
  "indian-rupee": IndianRupee,
  "receipt-text": ReceiptText,
  "calendar-check": CalendarCheck,
} as const satisfies Record<string, LucideIcon>;

export type StatIconName = keyof typeof STAT_ICONS;

export function StatCard({
  label,
  value,
  footer,
  icon,
}: {
  label: string;
  value: string;
  footer: string;
  icon: StatIconName;
}) {
  const Icon = STAT_ICONS[icon];
  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Card className="group relative h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--primary), transparent 88%), transparent 70%)",
          }}
        />
        <CardHeader>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
          <CardAction>
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
              <Icon className="size-4" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter>
          <p className="text-xs text-muted-foreground">{footer}</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
