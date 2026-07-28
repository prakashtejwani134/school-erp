import "server-only";
import type { PaymentMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { getFeeDues, type FeeDueRow } from "../data";

export type FeeCategoryBreakdown = {
  title: string;
  remainingAmount: number;
};

export type ReceiptHistoryRow = {
  id: string;
  receiptNo: string;
  feeTitle: string;
  paidAmount: number;
  paymentMode: PaymentMode;
  createdAt: string;
};

export type FinancialHubData = {
  feeDues: FeeDueRow[];
  totalFeeDue: number;
  categoryBreakdown: FeeCategoryBreakdown[];
  receipts: ReceiptHistoryRow[];
};

async function getReceiptHistory(
  schoolId: string,
  studentId: string,
): Promise<ReceiptHistoryRow[]> {
  const receipts = await prisma.feeReceipt.findMany({
    where: { schoolId, studentId },
    include: { feeDue: { include: { feeStructure: true } } },
    orderBy: { createdAt: "desc" },
  });

  return receipts.map((r) => ({
    id: r.id,
    receiptNo: r.receiptNo,
    feeTitle: r.feeDue.feeStructure.title,
    paidAmount: r.paidAmount,
    paymentMode: r.paymentMode,
    createdAt: formatDisplayDate(r.createdAt),
  }));
}

export async function getFinancialHubData(
  schoolId: string,
  studentId: string,
): Promise<FinancialHubData> {
  const [feeDues, receipts] = await Promise.all([
    getFeeDues(schoolId, studentId),
    getReceiptHistory(schoolId, studentId),
  ]);

  const totalFeeDue = feeDues.reduce((sum, due) => sum + due.remainingAmount, 0);

  // FeeCategoryRule has no FK to FeeStructure/FeeDue in the schema (they're
  // two independent models), so the closest "category" grouping actually
  // available is the fee structure's own title (e.g. "Tuition Fee", "Exam
  // Fee") rather than FeeCategoryRule.name.
  const remainingByTitle = new Map<string, number>();
  for (const due of feeDues) {
    remainingByTitle.set(
      due.title,
      (remainingByTitle.get(due.title) ?? 0) + due.remainingAmount,
    );
  }
  const categoryBreakdown: FeeCategoryBreakdown[] = [...remainingByTitle.entries()].map(
    ([title, remainingAmount]) => ({ title, remainingAmount }),
  );

  return { feeDues, totalFeeDue, categoryBreakdown, receipts };
}
