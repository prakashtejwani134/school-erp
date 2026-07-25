import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
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
  const userId = await getSession();
  if (!userId) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser) redirect("/login");

  const user = {
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  };

  return (
    <SidebarProvider>
      <CommandPalette />
      <AppSidebar />
      <SidebarInset>
        <SiteHeader user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
