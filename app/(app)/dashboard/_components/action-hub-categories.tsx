import type { ReactNode } from "react";
import {
  CalendarCheck,
  GraduationCap,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";

import type { NavKey } from "@/lib/rbac";

export type ActionHubLink = {
  key: NavKey;
  href: string;
  label: string;
  icon: ReactNode;
};

export type ActionHubCategory = {
  value: string;
  label: string;
  icon: ReactNode;
  links: ActionHubLink[];
};

// Single source of truth for the Command Center's accordion — every link's
// `key` is a real `NavKey` from lib/rbac.ts, filtered per-role in
// smart-action-hubs.tsx via `canAccess`, the same gate the sidebar and
// command palette already use. Fees is deliberately excluded here: it
// already has its own dedicated spot in the Executive Financial Ribbon at
// the top of the page, matching the parent portal's own convention of not
// duplicating a feature that already has a home elsewhere (see
// app/parent/_components/smart-category-grid.tsx). "Staff" and "Logistics"
// categories from the original spec have no backing routes in this
// codebase (no teacher/HR module, no transport/inventory module) — see the
// Command Center build report for that gap.
export const ACTION_HUB_CATEGORIES: ActionHubCategory[] = [
  {
    value: "academics",
    label: "Academics",
    icon: <GraduationCap className="size-4 text-muted-foreground" />,
    links: [
      { key: "students", href: "/students", label: "Students", icon: <Users className="size-4" /> },
      { key: "classes", href: "/classes", label: "Classes", icon: <GraduationCap className="size-4" /> },
      {
        key: "attendance",
        href: "/attendance",
        label: "Attendance",
        icon: <CalendarCheck className="size-4" />,
      },
    ],
  },
  {
    value: "administration",
    label: "Administration",
    icon: <ShieldCheck className="size-4 text-muted-foreground" />,
    links: [
      {
        key: "auditLogs",
        href: "/audit-logs",
        label: "Audit Logs",
        icon: <ScrollText className="size-4" />,
      },
      { key: "settings", href: "/settings", label: "Settings", icon: <Settings className="size-4" /> },
      { key: "profile", href: "/profile", label: "Profile", icon: <UserCircle className="size-4" /> },
    ],
  },
];
