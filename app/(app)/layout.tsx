import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getActiveSchoolContext } from "@/lib/school-context";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getActiveSchoolContext();
  if (!context) redirect("/login");

  const [currentUser, memberships] = await Promise.all([
    prisma.user.findUnique({ where: { id: context.userId } }),
    prisma.userSchool.findMany({
      where: { userId: context.userId },
      include: { school: true },
      orderBy: { school: { schoolName: "asc" } },
    }),
  ]);
  if (!currentUser) redirect("/login");

  const user = {
    name: currentUser.name,
    email: currentUser.email,
    role: context.role,
  };

  const schools = memberships.map((m) => ({
    id: m.schoolId,
    name: m.school.schoolName,
  }));

  return (
    <SidebarProvider>
      <CommandPalette role={context.role} />
      <AppSidebar
        role={context.role}
        schools={schools}
        activeSchoolId={context.schoolId}
      />
      <SidebarInset>
        <SiteHeader user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
