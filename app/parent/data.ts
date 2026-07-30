import "server-only";
import type { AttendanceStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";

export const CIRCULAR_RECENT_WINDOW_DAYS = 7;

export type FeeDueRow = {
  id: string;
  title: string;
  remainingAmount: number;
  dueDate: string;
};

export type AttentionStripData = {
  feeDues: FeeDueRow[];
  totalFeeDue: number;
  attendanceRatePercent: number;
  consecutiveAbsences: number;
  unreadCircularCount: number;
  hasRecentExamResult: boolean;
  // Queried but not yet surfaced as its own card — a future homework card
  // can read this straight off the same payload.
  pendingHomeworkCount: number;
};

export const RESULT_RECENT_WINDOW_DAYS = 7;

// "New" is approximated the same way as unread circulars above — by
// recency, since there's no per-parent "seen" tracking on marks either.
// Exported so the full performance page (app/parent/performance/) doesn't
// need to re-derive the same window.
export async function hasRecentExamResult(
  schoolId: string,
  studentId: string,
): Promise<boolean> {
  const since = new Date();
  since.setDate(since.getDate() - RESULT_RECENT_WINDOW_DAYS);

  const count = await prisma.mark.count({
    where: { studentId, exam: { schoolId }, createdAt: { gte: since } },
  });
  return count > 0;
}

export async function getFeeDues(schoolId: string, studentId: string): Promise<FeeDueRow[]> {
  const dues = await prisma.feeDue.findMany({
    where: { schoolId, studentId, isPaid: false },
    include: { feeStructure: true },
    orderBy: { feeStructure: { dueDate: "asc" } },
  });

  return dues.map((due) => ({
    id: due.id,
    title: due.feeStructure.title,
    remainingAmount: due.dueAmount - due.amountPaid,
    dueDate: formatDisplayDate(due.feeStructure.dueDate),
  }));
}

export type AttendanceRecord = { date: Date; status: AttendanceStatus };

// Scoped to the current calendar month only, per the "keep it simple" brief
// — no rolling-window streak tracking across a month boundary yet.
// Built with Date.UTC (not `new Date(y, m, d)`) for the same reason as
// lib/date.ts's parseDateParam: Attendance.date is a `@db.Date` column
// compared by UTC calendar day, so a local-midnight Date can shift a day in
// timezones ahead of UTC.
// Exported so the full attendance page (app/parent/attendance/) can reuse
// the same query and date-boundary logic instead of re-deriving it.
export async function getMonthlyAttendanceRecords(
  schoolId: string,
  studentId: string,
): Promise<AttendanceRecord[]> {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return prisma.attendance.findMany({
    where: { schoolId, studentId, date: { gte: startOfMonth, lt: startOfNextMonth } },
    orderBy: { date: "desc" },
    select: { date: true, status: true },
  });
}

// Pure computation, split out from the query above so both the attention
// strip and the full attendance page can derive rate/streak from the same
// records without a second round-trip or duplicated logic.
export function computeAttendanceSnapshot(
  records: AttendanceRecord[],
): { attendanceRatePercent: number; consecutiveAbsences: number } {
  if (records.length === 0) {
    return { attendanceRatePercent: 100, consecutiveAbsences: 0 };
  }

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const attendanceRatePercent = Math.round((presentCount / records.length) * 100);

  // Records are already sorted most-recent-first, so this is the current
  // unbroken run of ABSENT days ending today.
  let consecutiveAbsences = 0;
  for (const record of records) {
    if (record.status !== "ABSENT") break;
    consecutiveAbsences++;
  }

  return { attendanceRatePercent, consecutiveAbsences };
}

async function getAttendanceSnapshot(
  schoolId: string,
  studentId: string,
): Promise<{ attendanceRatePercent: number; consecutiveAbsences: number }> {
  const records = await getMonthlyAttendanceRecords(schoolId, studentId);
  return computeAttendanceSnapshot(records);
}

// There's no "last seen" timestamp on User/UserSchool yet, so "unread" is
// approximated by recency until that concept exists. Exported so the
// circulars page can reuse the exact same count instead of inventing a
// second definition of "unread".
export async function getUnreadCircularCount(schoolId: string): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - CIRCULAR_RECENT_WINDOW_DAYS);

  return prisma.circular.count({
    where: { schoolId, publishedAt: { gte: since } },
  });
}

// Homework has no submission/completion tracking yet, so "pending" is
// approximated by "not yet due".
async function getPendingHomeworkCount(
  schoolId: string,
  classId: string,
): Promise<number> {
  return prisma.homework.count({
    where: { schoolId, classId, dueDate: { gte: new Date() } },
  });
}

export async function getAttentionStripData(
  schoolId: string,
  student: { id: string; classId: string },
): Promise<AttentionStripData> {
  const [feeDues, attendance, unreadCircularCount, pendingHomeworkCount, recentResult] =
    await Promise.all([
      getFeeDues(schoolId, student.id),
      getAttendanceSnapshot(schoolId, student.id),
      getUnreadCircularCount(schoolId),
      getPendingHomeworkCount(schoolId, student.classId),
      hasRecentExamResult(schoolId, student.id),
    ]);

  const totalFeeDue = feeDues.reduce((sum, due) => sum + due.remainingAmount, 0);

  return {
    feeDues,
    totalFeeDue,
    attendanceRatePercent: attendance.attendanceRatePercent,
    consecutiveAbsences: attendance.consecutiveAbsences,
    unreadCircularCount,
    hasRecentExamResult: recentResult,
    pendingHomeworkCount,
  };
}
