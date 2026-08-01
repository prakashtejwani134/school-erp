import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getActiveSchoolContext } from "@/lib/school-context";
import { ParentCommandPalette } from "./_components/parent-command-palette";
import { ParentHeader } from "./_components/parent-header";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getActiveSchoolContext();
  if (!context) redirect("/login");
  if (context.role !== "PARENT") redirect("/dashboard");

  const user = await prisma.user.findUnique({ where: { id: context.userId } });
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <ParentCommandPalette />
      <ParentHeader name={user.name} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
