import "server-only";
import type { PaymentMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseDateParam, todayParam, formatRelativeTime } from "@/lib/date";
import { getDefaulterRiskProfiles } from "@/lib/analytics/defaulters";

export type PaymentModeShare = {
  mode: PaymentMode;
  amount: number;
  count: number;
};

export type FinancialRibbonSummary = {
  totalStudents: number;
  todayCollected: number;
  todayReceiptCount: number;
  byMode: PaymentModeShare[];
  pendingDuesAmount: number;
  pendingDuesCount: number;
  highRiskDefaulterCount: number;
};

/** Today's live collections (with payment-mode split), outstanding dues, and defaulter pressure — the Executive Financial Ribbon's data source. */
export async function getFinancialRibbonSummary(
  schoolId: string,
): Promise<FinancialRibbonSummary> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setDate(startOfNextDay.getDate() + 1);

  const [totalStudents, todayReceipts, pendingDues, riskProfiles] = await Promise.all([
    prisma.student.count({ where: { schoolId } }),
    prisma.feeReceipt.findMany({
      where: { schoolId, createdAt: { gte: startOfDay, lt: startOfNextDay } },
      select: { paidAmount: true, paymentMode: true },
    }),
    prisma.feeDue.findMany({
      where: { schoolId, isPaid: false },
      select: { dueAmount: true, amountPaid: true },
    }),
    getDefaulterRiskProfiles(schoolId),
  ]);

  const byModeMap = new Map<PaymentMode, PaymentModeShare>();
  let todayCollected = 0;
  for (const receipt of todayReceipts) {
    todayCollected += receipt.paidAmount;
    const existing = byModeMap.get(receipt.paymentMode);
    if (existing) {
      existing.amount += receipt.paidAmount;
      existing.count += 1;
    } else {
      byModeMap.set(receipt.paymentMode, {
        mode: receipt.paymentMode,
        amount: receipt.paidAmount,
        count: 1,
      });
    }
  }

  const pendingDuesAmount = pendingDues.reduce(
    (sum, due) => sum + (due.dueAmount - due.amountPaid),
    0,
  );

  const highRiskDefaulterCount = [...riskProfiles.values()].filter(
    (profile) => profile.risk === "HIGH",
  ).length;

  return {
    totalStudents,
    todayCollected,
    todayReceiptCount: todayReceipts.length,
    byMode: [...byModeMap.values()].sort((a, b) => b.amount - a.amount),
    pendingDuesAmount,
    pendingDuesCount: pendingDues.length,
    highRiskDefaulterCount,
  };
}

export type ClassAttendanceRadarRow = {
  classId: string;
  name: string;
  section: string;
  totalStudents: number;
  markedCount: number;
  presentCount: number;
  unmarkedCount: number;
  /** null when nobody in the class has been marked yet — distinct from a real 0%. */
  attendanceRate: number | null;
};

export type AttendanceRadar = {
  classes: ClassAttendanceRadarRow[];
  totalUnmarked: number;
};

/**
 * Class-wise attendance for today, with the unmarked count surfaced as its
 * own field on every row (never folded into `attendanceRate`) — a class
 * with nobody marked yet gets `attendanceRate: null`, not a misleading 0%.
 */
export async function getAttendanceRadar(schoolId: string): Promise<AttendanceRadar> {
  const today = parseDateParam(todayParam());

  const [classes, attendances] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId },
      include: { _count: { select: { students: true } } },
      orderBy: [{ name: "asc" }, { section: "asc" }],
    }),
    prisma.attendance.findMany({
      where: { schoolId, date: today },
      select: { status: true, student: { select: { classId: true } } },
    }),
  ]);

  const byClass = new Map<string, { marked: number; present: number }>();
  for (const attendance of attendances) {
    const classId = attendance.student.classId;
    const entry = byClass.get(classId) ?? { marked: 0, present: 0 };
    entry.marked += 1;
    if (attendance.status === "PRESENT") entry.present += 1;
    byClass.set(classId, entry);
  }

  let totalUnmarked = 0;
  const rows: ClassAttendanceRadarRow[] = classes.map((cls) => {
    const totalStudents = cls._count.students;
    const stats = byClass.get(cls.id) ?? { marked: 0, present: 0 };
    const unmarkedCount = Math.max(0, totalStudents - stats.marked);
    totalUnmarked += unmarkedCount;

    return {
      classId: cls.id,
      name: cls.name,
      section: cls.section,
      totalStudents,
      markedCount: stats.marked,
      presentCount: stats.present,
      unmarkedCount,
      attendanceRate:
        stats.marked > 0 ? Math.round((stats.present / stats.marked) * 100) : null,
    };
  });

  return { classes: rows, totalUnmarked };
}

export type ActivityItem = {
  id: string;
  actionType: string;
  details: string;
  userName: string;
  relativeTime: string;
};

const RECENT_ACTIVITY_LIMIT = 8;

/** Most recent audit-trail entries, reusing the same `AuditLog` model as the full `/audit-logs` page rather than a parallel activity log. */
export async function getRecentActivity(schoolId: string): Promise<ActivityItem[]> {
  const logs = await prisma.auditLog.findMany({
    where: { schoolId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: RECENT_ACTIVITY_LIMIT,
  });

  return logs.map((log) => ({
    id: log.id,
    actionType: log.actionType,
    details: log.details,
    userName: log.user.name,
    relativeTime: formatRelativeTime(log.createdAt),
  }));
}
