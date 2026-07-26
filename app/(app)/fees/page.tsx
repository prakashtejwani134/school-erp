import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { requireRouteAccess } from "@/lib/route-access";
import { getDefaulterRiskProfiles } from "@/lib/analytics/defaulters";
import { FeesClient } from "./fees-client";
import type {
  PendingDueRow,
  ReceiptRow,
  SchoolBranding,
  StudentOption,
} from "./types";

async function getPendingDues(schoolId: string): Promise<PendingDueRow[]> {
  const [dues, riskProfiles] = await Promise.all([
    prisma.feeDue.findMany({
      where: { schoolId, isPaid: false },
      include: { student: { include: { class: true } }, feeStructure: true },
      orderBy: [{ feeStructure: { dueDate: "asc" } }],
    }),
    getDefaulterRiskProfiles(schoolId),
  ]);

  return dues.map((due) => ({
    id: due.id,
    studentId: due.studentId,
    studentName: `${due.student.firstName} ${due.student.lastName}`,
    admissionNo: due.student.admissionNo,
    parentPhone: due.student.parentPhone,
    className: `${due.student.class.name}-${due.student.class.section}`,
    feeTitle: due.feeStructure.title,
    totalAmount: due.dueAmount,
    amountPaid: due.amountPaid,
    remainingAmount: due.dueAmount - due.amountPaid,
    dueDate: formatDisplayDate(due.feeStructure.dueDate),
    risk: riskProfiles.get(due.studentId)?.risk ?? "LOW",
  }));
}

async function getReceipts(schoolId: string): Promise<ReceiptRow[]> {
  const receipts = await prisma.feeReceipt.findMany({
    where: { schoolId },
    include: {
      student: { include: { class: true } },
      feeDue: { include: { feeStructure: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return receipts.map((r) => ({
    id: r.id,
    receiptNo: r.receiptNo,
    studentId: r.studentId,
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

async function getStudentOptions(schoolId: string): Promise<StudentOption[]> {
  const students = await prisma.student.findMany({
    where: { schoolId },
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

async function getSchoolBranding(schoolId: string): Promise<SchoolBranding> {
  const school = await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });

  return {
    schoolName: school.schoolName,
    logoUrl: school.logoUrl,
    address: school.address,
    phone: school.phone,
    email: school.email,
  };
}

export default async function FeesPage() {
  const { user, schoolId } = await requireRouteAccess("fees");

  const [pendingDues, receipts, students, branding] = await Promise.all([
    getPendingDues(schoolId),
    getReceipts(schoolId),
    getStudentOptions(schoolId),
    getSchoolBranding(schoolId),
  ]);

  return (
    <FeesClient
      pendingDues={pendingDues}
      receipts={receipts}
      students={students}
      currentUserName={user.name}
      branding={branding}
    />
  );
}
