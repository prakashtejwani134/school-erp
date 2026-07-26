import type { PaymentMode } from "@prisma/client";
import type { DefaulterRisk } from "@/lib/analytics/defaulters";

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
  parentPhone: string;
  className: string;
  feeTitle: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  dueDate: string;
  risk: DefaulterRisk;
};

export type ReceiptRow = {
  id: string;
  receiptNo: string;
  studentId: string;
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
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  dueDate: string;
};

export type SchoolBranding = {
  schoolName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
};
