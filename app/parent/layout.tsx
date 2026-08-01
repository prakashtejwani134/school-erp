import { redirect } from "next/navigation";

import { getActiveSchoolContext } from "@/lib/school-context";
import { ParentHeader } from "./_components/parent-header";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getActiveSchoolContext();
  if (!context) redirect("/login");
  if (context.role !== "PARENT") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <ParentHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
