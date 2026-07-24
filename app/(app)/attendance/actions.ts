"use server";

import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseDateParam } from "@/lib/date";

export type AttendanceRecordInput = {
  studentId: string;
  status: AttendanceStatus;
};

export async function saveAttendance(
  dateParam: string,
  records: AttendanceRecordInput[],
) {
  if (!dateParam) throw new Error("Date is required.");
  if (records.length === 0) return;

  const date = parseDateParam(dateParam);

  try {
    await prisma.$transaction(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: { studentId: record.studentId, date },
          },
          update: { status: record.status },
          create: { studentId: record.studentId, date, status: record.status },
        }),
      ),
    );
  } catch {
    throw new Error("Failed to save attendance. Please try again.");
  }

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}
