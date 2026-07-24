import type { PaymentMode } from "@prisma/client";

export type StudentOption = {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
};

export type PendingDueRow = {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  feeTitle: string;
  dueAmount: number;
  dueDate: string;
};

export type ReceiptRow = {
  id: string;
  receiptNo: string;
  studentName: string;
  admissionNo: string;
  className: string;
  feeTitle: string;
  paidAmount: number;
  paymentMode: PaymentMode;
  collectedBy: string;
  transactionId: string | null;
  createdAt: string;
};

export type StudentDue = {
  id: string;
  feeTitle: string;
  dueAmount: number;
  dueDate: string;
};
