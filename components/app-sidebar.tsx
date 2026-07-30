"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  NotebookPen,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { canAccess, type NavKey } from "@/lib/rbac";
import { SchoolSwitcher, type SchoolOption } from "@/components/school-switcher";

const navItems: {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  key: NavKey;
}[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { title: "Students", href: "/students", icon: Users, key: "students" },
  { title: "Classes", href: "/classes", icon: GraduationCap, key: "classes" },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck, key: "attendance" },
  { title: "Exams", href: "/exams", icon: NotebookPen, key: "exams" },
  { title: "Fees", href: "/fees", icon: IndianRupee, key: "fees" },
  { title: "Audit Logs", href: "/audit-logs", icon: ScrollText, key: "auditLogs" },
  { title: "Settings", href: "/settings", icon: Settings, key: "settings" },
];

export function AppSidebar({
  role,
  schools,
  activeSchoolId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  role: Role;
  schools: SchoolOption[];
  activeSchoolId: string;
}) {
  const pathname = usePathname();
  const visibleNavItems = navItems.filter((item) => canAccess(role, item.key));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SchoolSwitcher schools={schools} activeSchoolId={activeSchoolId} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
