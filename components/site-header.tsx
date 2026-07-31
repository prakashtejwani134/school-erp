"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/profile-menu";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/classes": "Classes",
  "/attendance": "Attendance",
  "/fees": "Fees",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
};

function titleForPath(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  return segment
    ? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    : "Dashboard";
}

export function SiteHeader({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const title = titleForPath(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1 size-11 md:size-7" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-6" />
        <ProfileMenu name={user.name} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
