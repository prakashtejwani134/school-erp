import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, CalendarPlus, CalendarX2, GraduationCap, LayoutGrid, Megaphone } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type CategoryLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

type Category = {
  value: string;
  label: string;
  icon: ReactNode;
  links: CategoryLink[];
};

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

export function SmartCategoryGrid() {
  return (
    <Accordion defaultValue={["academics"]} className="rounded-lg border px-4">
      {CATEGORIES.map((category) => (
        <AccordionItem key={category.value} value={category.value}>
          <AccordionTrigger>
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
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
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
