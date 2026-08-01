"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Role } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { canAccess } from "@/lib/rbac";
import { ACTION_HUB_CATEGORIES } from "./action-hub-categories";

// Matches the height/opacity convention from components/ui/expandable-table.tsx.
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CHEVRON_SPRING = { type: "spring", stiffness: 300, damping: 24 } as const;

// Hand-rolled rather than the shared components/ui/accordion.tsx primitive:
// that primitive is also used by the parent portal (circulars,
// smart-category-grid), out of scope for this pass, and its built-in
// chevron is a hardcoded icon-swap with no rotation hook exposed. This
// stays scoped to the Command Center's own accordion.
export function SmartActionHubs({ role }: { role: Role }) {
  const categories = ACTION_HUB_CATEGORIES.map((category) => ({
    ...category,
    links: category.links.filter((link) => canAccess(role, link.key)),
  })).filter((category) => category.links.length > 0);

  const [openValues, setOpenValues] = React.useState<Set<string>>(
    () => new Set(categories[0] ? [categories[0].value] : []),
  );

  if (categories.length === 0) return null;

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
      {categories.map((category, index) => {
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
