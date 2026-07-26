"use server";

import { revalidatePath } from "next/cache";
import { Prisma, PaymentMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { formatINR } from "@/lib/currency";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppReceipt } from "@/lib/whatsapp";
import { PAYMENT_MODE_LABELS } from "@/lib/payment-mode";
import { requireActiveSchoolContext } from "@/lib/school-context";
import type { StudentDue } from "./types";

const REFERENCE_REQUIRED_MODES: PaymentMode[] = [PaymentMode.UPI];
// Amounts are compared with a small epsilon to tolerate floating-point drift
// from repeated partial payments (e.g. three 0.1 payments not summing to exactly 0.3).
const AMOUNT_EPSILON = 0.01;

export async function getStudentDues(studentId: string): Promise<StudentDue[]> {
  if (!studentId) return [];
  const { schoolId } = await requireActiveSchoolContext();

  const dues = await prisma.feeDue.findMany({
    where: { studentId, schoolId, isPaid: false },
    include: { feeStructure: true },
    orderBy: { feeStructure: { dueDate: "asc" } },
  });

  return dues.map((due) => ({
    id: due.id,
    feeTitle: due.feeStructure.title,
    totalAmount: due.dueAmount,
    amountPaid: due.amountPaid,
    remainingAmount: due.dueAmount - due.amountPaid,
    dueDate: formatDisplayDate(due.feeStructure.dueDate),
  }));
}

export type CollectFeeInput = {
  feeDueId: string;
  amount: number;
  paymentMode: PaymentMode;
  transactionId: string;
  collectedBy: string;
};

export type CollectFeeResult = {
  receiptId: string;
  receiptNo: string;
  remainingAmount: number;
  isFullyPaid: boolean;
};

export async function collectFee(
  input: CollectFeeInput,
): Promise<CollectFeeResult> {
  const { schoolId } = await requireActiveSchoolContext();

  const feeDueId = input.feeDueId.trim();
  const collectedBy = input.collectedBy.trim();
  const transactionId = input.transactionId.trim();
  const amount = input.amount;

  if (!feeDueId) throw new Error("Select a pending due to collect.");
  if (!collectedBy) throw new Error("Collected by is required.");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid payment amount.");
  }
  if (!Object.values(PaymentMode).includes(input.paymentMode)) {
    throw new Error("Select a valid payment mode.");
  }
  if (REFERENCE_REQUIRED_MODES.includes(input.paymentMode) && !transactionId) {
    throw new Error("Transaction ID is required for this payment mode.");
  }

  try {
    const receipt = await prisma.$transaction(async (tx) => {
      const feeDue = await tx.feeDue.findFirst({
        where: { id: feeDueId, schoolId },
        include: { student: true, feeStructure: true },
      });

      if (!feeDue) throw new Error("This fee due no longer exists.");
      if (feeDue.isPaid) throw new Error("This fee due has already been paid.");

      const remainingAmount = feeDue.dueAmount - feeDue.amountPaid;
      if (amount > remainingAmount + AMOUNT_EPSILON) {
        throw new Error(
          `Amount exceeds the remaining due of ${formatINR(remainingAmount)}.`,
        );
      }

      const school = await tx.school.findUniqueOrThrow({ where: { id: schoolId } });
      // Counted per-school and namespaced with the school's `code` so two
      // tenants' locally-numbered receipts can never collide on the global
      // `receiptNo` unique constraint.
      const receiptCount = await tx.feeReceipt.count({ where: { schoolId } });
      const receiptNo = `RCPT-${school.code}-${new Date().getFullYear()}-${String(
        receiptCount + 1,
      ).padStart(4, "0")}`;

      const created = await tx.feeReceipt.create({
        data: {
          schoolId,
          receiptNo,
          studentId: feeDue.studentId,
          feeDueId: feeDue.id,
          paidAmount: amount,
          paymentMode: input.paymentMode,
          collectedBy,
          transactionId: transactionId || null,
        },
      });

      const newAmountPaid = feeDue.amountPaid + amount;
      const isFullyPaid = newAmountPaid >= feeDue.dueAmount - AMOUNT_EPSILON;

      await tx.feeDue.update({
        where: { id: feeDue.id },
        data: { amountPaid: newAmountPaid, isPaid: isFullyPaid },
      });

      return {
        created,
        feeDue,
        remainingAmount: isFullyPaid ? 0 : feeDue.dueAmount - newAmountPaid,
        isFullyPaid,
      };
    });

    const paymentSummary = receipt.isFullyPaid
      ? `${formatINR(receipt.created.paidAmount)} (paid in full)`
      : `${formatINR(receipt.created.paidAmount)} (partial — ${formatINR(receipt.remainingAmount)} remaining)`;

    await logAudit({
      actionType: "FEE_COLLECTED",
      targetEntity: "FeeReceipt",
      targetId: receipt.created.id,
      details: `Receipt ${receipt.created.receiptNo} — ${paymentSummary} — ${receipt.feeDue.feeStructure.title} for ${receipt.feeDue.student.firstName} ${receipt.feeDue.student.lastName} via ${PAYMENT_MODE_LABELS[input.paymentMode]}`,
    });

    sendWhatsAppReceipt(receipt.created.id).catch(() => {
      // Mock service — failures here must never block fee collection.
    });

    revalidatePath("/fees");
    revalidatePath("/dashboard");
    revalidatePath("/students");

    return {
      receiptId: receipt.created.id,
      receiptNo: receipt.created.receiptNo,
      remainingAmount: receipt.remainingAmount,
      isFullyPaid: receipt.isFullyPaid,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      !(error instanceof Prisma.PrismaClientKnownRequestError)
    ) {
      throw error;
    }
    throw new Error("Failed to collect fee. Please try again.");
  }
}

/** Sum of a student's other still-unpaid balances — used on the receipt as "Balance Remaining". */
export async function getStudentOutstandingBalance(
  studentId: string,
): Promise<number> {
  const { schoolId } = await requireActiveSchoolContext();
  const dues = await prisma.feeDue.findMany({
    where: { studentId, schoolId, isPaid: false },
    select: { dueAmount: true, amountPaid: true },
  });
  return dues.reduce((sum, due) => sum + (due.dueAmount - due.amountPaid), 0);
}
