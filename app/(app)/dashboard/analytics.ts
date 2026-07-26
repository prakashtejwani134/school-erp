import { prisma } from "@/lib/prisma";

export type MonthlyFinancial = {
  month: string;
  collected: number;
  pending: number;
};

/** Collections received vs. dues that came due, per calendar month, for the trailing 6 months. */
export async function getMonthlyFinancials(
  schoolId: string,
): Promise<MonthlyFinancial[]> {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    const label = start.toLocaleDateString("en-IN", { month: "short" });
    return { label, start, end };
  });

  const earliestStart = months[0].start;
  const latestEnd = months[months.length - 1].end;

  const [receipts, dues] = await Promise.all([
    prisma.feeReceipt.findMany({
      where: { schoolId, createdAt: { gte: earliestStart, lt: latestEnd } },
      select: { paidAmount: true, createdAt: true },
    }),
    prisma.feeDue.findMany({
      where: {
        schoolId,
        isPaid: false,
        feeStructure: { dueDate: { gte: earliestStart, lt: latestEnd } },
      },
      select: { dueAmount: true, feeStructure: { select: { dueDate: true } } },
    }),
  ]);

  return months.map(({ label, start, end }) => {
    const collected = receipts
      .filter((r) => r.createdAt >= start && r.createdAt < end)
      .reduce((sum, r) => sum + r.paidAmount, 0);
    const pending = dues
      .filter(
        (d) => d.feeStructure.dueDate >= start && d.feeStructure.dueDate < end,
      )
      .reduce((sum, d) => sum + d.dueAmount, 0);
    return { month: label, collected, pending };
  });
}

export type DashboardForecast = {
  forecastedCollection: number;
  previousMonthCollection: number;
  /** null when the previous month collected nothing — growth % is undefined, not zero. */
  growthPercent: number | null;
};

/**
 * Run-rate forecast for the current calendar month (collected-so-far scaled
 * to a full month by day-of-month progress) plus growth vs. the previous
 * full month, computed against the same forecasted total for a fair
 * full-month-to-full-month comparison.
 */
export async function getDashboardForecast(
  schoolId: string,
): Promise<DashboardForecast> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [currentMonthAgg, previousMonthAgg] = await Promise.all([
    prisma.feeReceipt.aggregate({
      _sum: { paidAmount: true },
      where: { schoolId, createdAt: { gte: startOfMonth, lte: now } },
    }),
    prisma.feeReceipt.aggregate({
      _sum: { paidAmount: true },
      where: {
        schoolId,
        createdAt: { gte: startOfPrevMonth, lt: startOfMonth },
      },
    }),
  ]);

  const collectedSoFar = currentMonthAgg._sum.paidAmount ?? 0;
  const previousMonthCollection = previousMonthAgg._sum.paidAmount ?? 0;

  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const forecastedCollection = Math.round(
    (collectedSoFar / dayOfMonth) * daysInMonth,
  );

  const growthPercent =
    previousMonthCollection > 0
      ? ((forecastedCollection - previousMonthCollection) /
          previousMonthCollection) *
        100
      : null;

  return { forecastedCollection, previousMonthCollection, growthPercent };
}

export type FeeCategoryShare = {
  category: string;
  amount: number;
};

const MAX_CATEGORY_SLICES = 6;

/** Total collected per fee category (proxied by FeeStructure title — there's no separate category field). Long tail folds into "Other". */
export async function getFeeCategoryBreakdown(
  schoolId: string,
): Promise<FeeCategoryShare[]> {
  const receipts = await prisma.feeReceipt.findMany({
    where: { schoolId },
    include: { feeDue: { include: { feeStructure: true } } },
  });

  const totals = new Map<string, number>();
  for (const r of receipts) {
    const title = r.feeDue.feeStructure.title;
    totals.set(title, (totals.get(title) ?? 0) + r.paidAmount);
  }

  const sorted = [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  if (sorted.length <= MAX_CATEGORY_SLICES) return sorted;

  const top = sorted.slice(0, MAX_CATEGORY_SLICES - 1);
  const otherTotal = sorted
    .slice(MAX_CATEGORY_SLICES - 1)
    .reduce((sum, s) => sum + s.amount, 0);
  return [...top, { category: "Other", amount: otherTotal }];
}
