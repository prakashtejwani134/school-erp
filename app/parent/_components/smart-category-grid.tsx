"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, CalendarPlus, CalendarX2, ChevronDown, GraduationCap, LayoutGrid, Megaphone, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CategoryLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type Category = {
  value: string;
  label: string;
  icon: React.ReactNode;
  links: CategoryLink[];
};

// Matches the height/opacity convention from components/ui/expandable-table.tsx.
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CHEVRON_SPRING = { type: "spring", stiffness: 300, damping: 24 } as const;

// Grouped by what actually exists in the parent portal today. Fees/payment
// links are intentionally excluded — those live only in Financial Hub
// (financial-hub-card.tsx), not duplicated here.
const CATEGORIES: Category[] = [
  {
    value: "academics",
    label: "Academics",
    icon: <GraduationCap className="size-4 text-muted-foreground" />,
    links: [
      { href: "/parent/attendance", label: "Attendance", icon: <CalendarX2 className="size-4" /> },
      { href: "/parent/performance", label: "Performance", icon: <Trophy className="size-4" /> },
      { href: "/parent/homework", label: "Homework", icon: <BookOpen className="size-4" /> },
    ],
  },
  {
    value: "communication",
    label: "Communication",
    icon: <Megaphone className="size-4 text-muted-foreground" />,
    links: [
      { href: "/parent/circulars", label: "Circulars", icon: <Megaphone className="size-4" /> },
    ],
  },
  {
    value: "others",
    label: "Others",
    icon: <LayoutGrid className="size-4 text-muted-foreground" />,
    links: [
      { href: "/parent/leave", label: "Apply Leave", icon: <CalendarPlus className="size-4" /> },
    ],
  },
];

// Hand-rolled rather than the shared components/ui/accordion.tsx primitive —
// same reasoning as the admin Command Center's smart-action-hubs.tsx: that
// primitive's chevron is a hardcoded icon-swap with no rotation hook, and
// this stays scoped to the parent portal's own fixed nav menu.
export function SmartCategoryGrid() {
  const [openValues, setOpenValues] = React.useState<Set<string>>(
    () => new Set(["academics"]),
  );

  function toggle(value: string) {
    setOpenValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <Card className="gap-0 px-4">
      {CATEGORIES.map((category, index) => {
        const isOpen = openValues.has(category.value);
        return (
          <div
            key={category.value}
            className={cn(index > 0 && "border-t border-border")}
          >
            <button
              type="button"
              onClick={() => toggle(category.value)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-3 text-left text-sm font-medium transition-colors hover:bg-accent max-md:py-3.5"
            >
              <span className="flex items-center gap-2">
                {category.icon}
                {category.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={CHEVRON_SPRING}
                className="text-muted-foreground"
              >
                <ChevronDown className="size-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1 pb-3">
                    {category.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm text-foreground transition-colors hover:bg-accent max-md:py-3"
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </Card>
  );
}
