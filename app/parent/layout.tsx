import { redirect } from "next/navigation";

import { getActiveSchoolContext } from "@/lib/school-context";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getActiveSchoolContext();
  if (!context) redirect("/login");
  if (context.role !== "PARENT") redirect("/dashboard");

  return <>{children}</>;
}
