"use server";

import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseDateParam, formatDisplayDate } from "@/lib/date";
import { logAudit } from "@/lib/audit";
import { requireActiveSchoolContext } from "@/lib/school-context";

export type AttendanceRecordInput = {
  studentId: string;
  status: AttendanceStatus;
};

export async function saveAttendance(
  dateParam: string,
  records: AttendanceRecordInput[],
  classLabel: string,
) {
  if (!dateParam) throw new Error("Date is required.");
  if (records.length === 0) return;

  const { schoolId } = await requireActiveSchoolContext();
  const date = parseDateParam(dateParam);

  // Defends against a tampered batch payload referencing students outside
  // the active school.
  const validStudentCount = await prisma.student.count({
    where: { id: { in: records.map((r) => r.studentId) }, schoolId },
  });
  if (validStudentCount !== records.length) {
    throw new Error("One or more students don't belong to this school.");
  }

  try {
    await prisma.$transaction(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: { studentId: record.studentId, date },
          },
          update: { status: record.status },
          create: {
            schoolId,
            studentId: record.studentId,
            date,
            status: record.status,
          },
        }),
      ),
    );
  } catch {
    throw new Error("Failed to save attendance. Please try again.");
  }

  await logAudit({
    actionType: "ATTENDANCE_MARKED",
    targetEntity: "Attendance",
    details: `Class ${classLabel} — ${records.length} student${records.length === 1 ? "" : "s"} recorded for ${formatDisplayDate(date)}`,
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}
