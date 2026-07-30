import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { requireRouteAccess } from "@/lib/route-access";
import { StudentsClient } from "./students-client";
import type { ClassOption, FeeStatus, StudentRow } from "./types";

async function getStudents(schoolId: string): Promise<StudentRow[]> {
  const students = await prisma.student.findMany({
    where: { schoolId },
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
      concessionReason: student.concessionReason,
      feeStatus,
      pendingDueCount,
    };
  });
}

async function getClasses(schoolId: string): Promise<ClassOption[]> {
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });
  return classes.map((c) => ({ id: c.id, name: c.name, section: c.section }));
}

export default async function StudentsPage() {
  const { schoolId } = await requireRouteAccess("students");

  const [students, classes] = await Promise.all([
    getStudents(schoolId),
    getClasses(schoolId),
  ]);

  return <StudentsClient students={students} classes={classes} />;
}
