import { prisma } from "@/lib/prisma";
import { requireRouteAccess } from "@/lib/route-access";
import { ClassesTable } from "./classes-table";
import type { ClassRow } from "./types";

async function getClasses(schoolId: string): Promise<ClassRow[]> {
  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: { _count: { select: { students: true } } },
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    section: c.section,
    studentCount: c._count.students,
  }));
}

export default async function ClassesPage() {
  const { schoolId } = await requireRouteAccess("classes");

  const classes = await getClasses(schoolId);

  return (
    <div className="flex flex-col gap-4">
      <ClassesTable classes={classes} />
    </div>
  );
}
