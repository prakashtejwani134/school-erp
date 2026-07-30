import Link from "next/link";
import type { Role } from "@prisma/client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { canAccess } from "@/lib/rbac";
import { ACTION_HUB_CATEGORIES } from "./action-hub-categories";

export function SmartActionHubs({ role }: { role: Role }) {
  const categories = ACTION_HUB_CATEGORIES.map((category) => ({
    ...category,
    links: category.links.filter((link) => canAccess(role, link.key)),
  })).filter((category) => category.links.length > 0);

  if (categories.length === 0) return null;

  return (
    <Accordion defaultValue={["academics"]} className="rounded-lg border px-4">
      {categories.map((category) => (
        <AccordionItem key={category.value} value={category.value}>
          <AccordionTrigger className="max-md:py-3.5">
            <span className="flex items-center gap-2">
              {category.icon}
              {category.label}
            </span>
          </AccordionTrigger>
          <AccordionContent className="[&_a]:no-underline">
            <div className="flex flex-col gap-1">
              {category.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted max-md:py-3"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
