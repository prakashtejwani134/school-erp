import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { FeesClient } from "./fees-client";
import type { PendingDueRow, ReceiptRow, StudentOption } from "./types";

async function getPendingDues(): Promise<PendingDueRow[]> {
  const dues = await prisma.feeDue.findMany({
    where: { isPaid: false },
    include: { student: { include: { class: true } }, feeStructure: true },
    orderBy: [{ feeStructure: { dueDate: "asc" } }],
  });

  return dues.map((due) => ({
    id: due.id,
    studentId: due.studentId,
    studentName: `${due.student.firstName} ${due.student.lastName}`,
    admissionNo: due.student.admissionNo,
    className: `${due.student.class.name}-${due.student.class.section}`,
    feeTitle: due.feeStructure.title,
    dueAmount: due.dueAmount,
    dueDate: formatDisplayDate(due.feeStructure.dueDate),
  }));
}

async function getReceipts(): Promise<ReceiptRow[]> {
  const receipts = await prisma.feeReceipt.findMany({
    include: {
      student: { include: { class: true } },
      feeDue: { include: { feeStructure: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return receipts.map((r) => ({
    id: r.id,
    receiptNo: r.receiptNo,
    studentName: `${r.student.firstName} ${r.student.lastName}`,
    admissionNo: r.student.admissionNo,
    className: `${r.student.class.name}-${r.student.class.section}`,
    feeTitle: r.feeDue.feeStructure.title,
    paidAmount: r.paidAmount,
    paymentMode: r.paymentMode,
    collectedBy: r.collectedBy,
    transactionId: r.transactionId,
    createdAt: formatDisplayDate(r.createdAt),
  }));
}

async function getStudentOptions(): Promise<StudentOption[]> {
  const students = await prisma.student.findMany({
    include: { class: true },
    orderBy: [{ firstName: "asc" }],
  });

  return students.map((s) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    admissionNo: s.admissionNo,
    className: `${s.class.name}-${s.class.section}`,
  }));
}

async function getCurrentUserName(): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { role: "DIRECTOR" },
    orderBy: { createdAt: "asc" },
  });
  return user?.name ?? "Admin";
}

export default async function FeesPage() {
  const [pendingDues, receipts, students, currentUserName] = await Promise.all([
    getPendingDues(),
    getReceipts(),
    getStudentOptions(),
    getCurrentUserName(),
  ]);

  return (
    <FeesClient
      pendingDues={pendingDues}
      receipts={receipts}
      students={students}
      currentUserName={currentUserName}
    />
  );
}
