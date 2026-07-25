"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  Plus,
  ScrollText,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/students", icon: Users },
  { title: "Classes", href: "/classes", icon: GraduationCap },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck },
  { title: "Fees", href: "/fees", icon: IndianRupee },
  { title: "Audit Logs", href: "/audit-logs", icon: ScrollText },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Profile", href: "/profile", icon: UserRound },
];

const QUICK_ACTIONS = [
  { title: "Add Student", href: "/students?action=new", icon: Plus },
  { title: "Collect Fee", href: "/fees?action=collect", icon: Plus },
  { title: "Mark Attendance", href: "/attendance", icon: CalendarCheck },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      // Stops Ctrl+K/Cmd+K from opening the browser's address bar search.
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
      <CommandInput placeholder="Search pages or run a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.title}
              value={action.title}
              onSelect={() => runCommand(action.href)}
            >
              <action.icon />
              {action.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
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
