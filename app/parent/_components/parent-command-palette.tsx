"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarPlus,
  CalendarX2,
  Home,
  Megaphone,
  Trophy,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Parent-portal analog of components/command-palette.tsx. Not reusing that
// component directly: its NAV_ITEMS/canAccess filtering is built around
// admin NavKeys (dashboard/students/classes/...) that map to app/(app)/*
// routes, none of which are the parent's actual routes — filtering PARENT's
// role would just leave "Dashboard"/"Profile" pointing at pages the parent
// layout immediately redirects away from. This has its own fixed list of
// real /parent/* destinations instead, since there are no role tiers to
// gate on within the parent portal itself.
const NAV_ITEMS = [
  { title: "Home", href: "/parent", icon: Home },
  { title: "Attendance", href: "/parent/attendance", icon: CalendarX2 },
  { title: "Performance", href: "/parent/performance", icon: Trophy },
  { title: "Circulars", href: "/parent/circulars", icon: Megaphone },
  { title: "Homework", href: "/parent/homework", icon: BookOpen },
  { title: "Apply Leave", href: "/parent/leave", icon: CalendarPlus },
];

export function ParentCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function runCommand(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={item.title}
              onSelect={() => runCommand(item.href)}
            >
              <item.icon />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
