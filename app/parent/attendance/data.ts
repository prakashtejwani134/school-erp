import "server-only";
import type { AttendanceStatus } from "@prisma/client";

import { formatDisplayDate } from "@/lib/date";
import { computeAttendanceSnapshot, getMonthlyAttendanceRecords } from "../data";

export type AttendanceDayRow = {
  date: string;
  status: AttendanceStatus;
};

export type AttendancePageData = {
  attendanceRatePercent: number;
  consecutiveAbsences: number;
  days: AttendanceDayRow[];
};

// Reuses the same query + computation the attention strip already uses
// (../data.ts) rather than re-deriving the current-month boundary logic.
export async function getAttendancePageData(
  schoolId: string,
  studentId: string,
): Promise<AttendancePageData> {
  const records = await getMonthlyAttendanceRecords(schoolId, studentId);
  const { attendanceRatePercent, consecutiveAbsences } = computeAttendanceSnapshot(records);

  const days: AttendanceDayRow[] = records.map((r) => ({
    date: formatDisplayDate(r.date),
    status: r.status,
  }));

  return { attendanceRatePercent, consecutiveAbsences, days };
}
