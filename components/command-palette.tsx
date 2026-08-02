"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  CalendarCheck,
  ClipboardList,
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
import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/command-palette-trigger";
import { canAccess, type NavKey } from "@/lib/rbac";

const NAV_ITEMS: { title: string; href: string; icon: typeof LayoutDashboard; key: NavKey }[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { title: "Students", href: "/students", icon: Users, key: "students" },
  { title: "Classes", href: "/classes", icon: GraduationCap, key: "classes" },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck, key: "attendance" },
  { title: "Exams", href: "/exams", icon: ClipboardList, key: "exams" },
  { title: "Fees", href: "/fees", icon: IndianRupee, key: "fees" },
  { title: "Audit Logs", href: "/audit-logs", icon: ScrollText, key: "auditLogs" },
  { title: "Settings", href: "/settings", icon: Settings, key: "settings" },
  { title: "Profile", href: "/profile", icon: UserRound, key: "profile" },
];

const QUICK_ACTIONS: { title: string; href: string; icon: typeof Plus; key: NavKey }[] = [
  { title: "Add Student", href: "/students?action=new", icon: Plus, key: "students" },
  { title: "Collect Fee", href: "/fees?action=collect", icon: Plus, key: "fees" },
  { title: "Mark Attendance", href: "/attendance", icon: CalendarCheck, key: "attendance" },
];

export function CommandPalette({ role }: { role: Role }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const visibleNavItems = NAV_ITEMS.filter((item) => canAccess(role, item.key));
  const visibleQuickActions = QUICK_ACTIONS.filter((item) =>
    canAccess(role, item.key),
  );

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

  React.useEffect(() => {
    function handleOpenEvent() {
      setOpen(true);
    }
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent);
    return () => window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent);
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
          {visibleQuickActions.map((action) => (
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
          {visibleNavItems.map((item) => (
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
