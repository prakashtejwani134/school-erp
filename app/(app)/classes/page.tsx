import { prisma } from "@/lib/prisma";
import { ClassesTable } from "./classes-table";
import type { ClassRow } from "./types";

async function getClasses(): Promise<ClassRow[]> {
  const classes = await prisma.class.findMany({
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
  const classes = await getClasses();

  return (
    <div className="flex flex-col gap-4">
      <ClassesTable classes={classes} />
    </div>
  );
}
