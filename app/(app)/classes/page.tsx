import { prisma } from "@/lib/prisma";
import { PageFadeIn } from "@/components/motion/fade-in";
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
    <PageFadeIn className="flex flex-col gap-4">
      <ClassesTable classes={classes} />
    </PageFadeIn>
  );
}
