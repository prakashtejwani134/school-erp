"use server";

import { revalidatePath } from "next/cache";
import { Prisma, PaymentMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import type { StudentDue } from "./types";

const REFERENCE_REQUIRED_MODES: PaymentMode[] = [PaymentMode.UPI];

export async function getStudentDues(studentId: string): Promise<StudentDue[]> {
  if (!studentId) return [];

  const dues = await prisma.feeDue.findMany({
    where: { studentId, isPaid: false },
    include: { feeStructure: true },
    orderBy: { feeStructure: { dueDate: "asc" } },
  });

  return dues.map((due) => ({
    id: due.id,
    feeTitle: due.feeStructure.title,
    dueAmount: due.dueAmount,
    dueDate: formatDisplayDate(due.feeStructure.dueDate),
  }));
}

export type CollectFeeInput = {
  feeDueId: string;
  paymentMode: PaymentMode;
  transactionId: string;
  collectedBy: string;
};

export async function collectFee(
  input: CollectFeeInput,
): Promise<{ receiptId: string; receiptNo: string }> {
  const feeDueId = input.feeDueId.trim();
  const collectedBy = input.collectedBy.trim();
  const transactionId = input.transactionId.trim();

  if (!feeDueId) throw new Error("Select a pending due to collect.");
  if (!collectedBy) throw new Error("Collected by is required.");
  if (!Object.values(PaymentMode).includes(input.paymentMode)) {
    throw new Error("Select a valid payment mode.");
  }
  if (REFERENCE_REQUIRED_MODES.includes(input.paymentMode) && !transactionId) {
    throw new Error("Transaction ID is required for this payment mode.");
  }

  try {
    const receipt = await prisma.$transaction(async (tx) => {
      const feeDue = await tx.feeDue.findUnique({ where: { id: feeDueId } });

      if (!feeDue) throw new Error("This fee due no longer exists.");
      if (feeDue.isPaid) throw new Error("This fee due has already been paid.");

      const receiptCount = await tx.feeReceipt.count();
      const receiptNo = `RCPT-${new Date().getFullYear()}-${String(
        receiptCount + 1,
      ).padStart(4, "0")}`;

      const created = await tx.feeReceipt.create({
        data: {
          receiptNo,
          studentId: feeDue.studentId,
          feeDueId: feeDue.id,
          paidAmount: feeDue.dueAmount,
          paymentMode: input.paymentMode,
          collectedBy,
          transactionId: transactionId || null,
        },
      });

      await tx.feeDue.update({
        where: { id: feeDue.id },
        data: { isPaid: true },
      });

      return created;
    });

    revalidatePath("/fees");
    revalidatePath("/dashboard");
    revalidatePath("/students");

    return { receiptId: receipt.id, receiptNo: receipt.receiptNo };
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
