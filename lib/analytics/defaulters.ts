import "server-only";

import { prisma } from "@/lib/prisma";

export type DefaulterRisk = "LOW" | "MEDIUM" | "HIGH";

export type StudentRiskProfile = {
  studentId: string;
  pendingDueCount: number;
  maxOverdueDays: number;
  overdueAmount: number;
  latePaymentRatio: number;
  riskScore: number;
  risk: DefaulterRisk;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Weighted, deterministic scoring — no ML involved. Overdue days matter most
// (a due that's actually late is the clearest signal), pending count next
// (multiple simultaneous dues compounds risk), and the student's historical
// late-payment ratio last (a softer, longer-run signal). Each component is
// capped before weighting so one extreme outlier can't blow out the score.
const OVERDUE_DAYS_CAP = 90;
const PENDING_COUNT_CAP = 3;
const OVERDUE_DAYS_WEIGHT = 50;
const PENDING_COUNT_WEIGHT = 25;
const LATE_RATIO_WEIGHT = 25;

const HIGH_THRESHOLD = 55;
const MEDIUM_THRESHOLD = 25;

function scoreToRisk(score: number): DefaulterRisk {
  if (score >= HIGH_THRESHOLD) return "HIGH";
  if (score >= MEDIUM_THRESHOLD) return "MEDIUM";
  return "LOW";
}

/**
 * Computes a fee-defaulter risk profile for every student in the school who
 * currently has at least one pending due. Keyed by studentId for O(1)
 * lookup when merging onto a pending-dues table row.
 */
export async function getDefaulterRiskProfiles(
  schoolId: string,
): Promise<Map<string, StudentRiskProfile>> {
  const pendingDues = await prisma.feeDue.findMany({
    where: { schoolId, isPaid: false },
    select: {
      studentId: true,
      dueAmount: true,
      amountPaid: true,
      feeStructure: { select: { dueDate: true } },
    },
  });

  if (pendingDues.length === 0) return new Map();

  const studentIds = [...new Set(pendingDues.map((d) => d.studentId))];

  const pastReceipts = await prisma.feeReceipt.findMany({
    where: { schoolId, studentId: { in: studentIds } },
    select: {
      studentId: true,
      createdAt: true,
      feeDue: { select: { feeStructure: { select: { dueDate: true } } } },
    },
  });

  const now = Date.now();
  const profiles = new Map<string, StudentRiskProfile>();

  for (const studentId of studentIds) {
    const dues = pendingDues.filter((d) => d.studentId === studentId);

    let maxOverdueDays = 0;
    let overdueAmount = 0;
    for (const due of dues) {
      const overdueDays = Math.max(
        0,
        Math.floor((now - due.feeStructure.dueDate.getTime()) / MS_PER_DAY),
      );
      if (overdueDays > 0) overdueAmount += due.dueAmount - due.amountPaid;
      maxOverdueDays = Math.max(maxOverdueDays, overdueDays);
    }

    const receipts = pastReceipts.filter((r) => r.studentId === studentId);
    const lateReceipts = receipts.filter(
      (r) => r.createdAt > r.feeDue.feeStructure.dueDate,
    );
    const latePaymentRatio =
      receipts.length > 0 ? lateReceipts.length / receipts.length : 0;

    const riskScore = Math.round(
      Math.min(maxOverdueDays / OVERDUE_DAYS_CAP, 1) * OVERDUE_DAYS_WEIGHT +
        Math.min(dues.length / PENDING_COUNT_CAP, 1) * PENDING_COUNT_WEIGHT +
        latePaymentRatio * LATE_RATIO_WEIGHT,
    );

    profiles.set(studentId, {
      studentId,
      pendingDueCount: dues.length,
      maxOverdueDays,
      overdueAmount,
      latePaymentRatio,
      riskScore,
      risk: scoreToRisk(riskScore),
    });
  }

  return profiles;
}
