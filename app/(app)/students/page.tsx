import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { StudentsClient } from "./students-client";
import type { ClassOption, FeeStatus, StudentRow } from "./types";

async function getStudents(): Promise<StudentRow[]> {
  const students = await prisma.student.findMany({
    include: {
      class: true,
      feeDues: { select: { isPaid: true } },
    },
    orderBy: [{ class: { name: "asc" } }, { firstName: "asc" }],
  });

  return students.map((student) => {
    const pendingDueCount = student.feeDues.filter((due) => !due.isPaid).length;
    const feeStatus: FeeStatus =
      student.feeDues.length === 0
        ? "NONE"
        : pendingDueCount === 0
          ? "PAID"
          : "PENDING";

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNo: student.admissionNo,
      parentPhone: student.parentPhone,
      address: student.address,
      enrolledAt: formatDisplayDate(student.createdAt),
      classId: student.classId,
      className: `${student.class.name}-${student.class.section}`,
      isDiscounted: student.isDiscounted,
      feeStatus,
      pendingDueCount,
    };
  });
}

async function getClasses(): Promise<ClassOption[]> {
  const classes = await prisma.class.findMany({
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });
  return classes.map((c) => ({ id: c.id, name: c.name, section: c.section }));
}

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    getStudents(),
    getClasses(),
  ]);

  return <StudentsClient students={students} classes={classes} />;
}
