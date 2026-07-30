import { NotebookPen } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { PlaceholderPage } from "@/components/placeholder-page";
import { requireRouteAccess } from "@/lib/route-access";
import { ExamsClient } from "./exams-client";
import type { ClassOption, ExamRow, SubjectOption } from "./types";

export default async function ExamsPage() {
  const { schoolId } = await requireRouteAccess("exams");

  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });

  if (classes.length === 0) {
    return (
      <PlaceholderPage
        title="Exams"
        description="Add a class before you can create an exam."
        icon={NotebookPen}
      />
    );
  }

  const [subjects, exams] = await Promise.all([
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: "asc" } }),
    prisma.exam.findMany({
      where: { schoolId },
      include: { class: true },
      orderBy: { examDate: "desc" },
    }),
  ]);

  const classOptions: ClassOption[] = classes.map((c) => ({
    id: c.id,
    name: c.name,
    section: c.section,
  }));

  const subjectOptions: SubjectOption[] = subjects.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const examRows: ExamRow[] = exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    examDate: formatDisplayDate(exam.examDate),
    classId: exam.classId,
    className: `${exam.class.name}-${exam.class.section}`,
  }));

  return (
    <ExamsClient
      classes={classOptions}
      subjects={subjectOptions}
      exams={examRows}
    />
  );
}
