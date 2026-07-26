import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { toCsv } from "@/lib/csv";
import { PAYMENT_MODE_LABELS } from "@/lib/payment-mode";
import { getActiveSchoolContext } from "@/lib/school-context";

export async function GET() {
  const context = await getActiveSchoolContext();
  if (!context) {
    return new Response("Unauthorized", { status: 401 });
  }

  const receipts = await prisma.feeReceipt.findMany({
    where: { schoolId: context.schoolId },
    include: {
      student: { include: { class: true } },
      feeDue: { include: { feeStructure: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = receipts.map((r) => ({
    receiptNo: r.receiptNo,
    studentName: `${r.student.firstName} ${r.student.lastName}`,
    admissionNo: r.student.admissionNo,
    className: `${r.student.class.name}-${r.student.class.section}`,
    feeTitle: r.feeDue.feeStructure.title,
    paidAmount: r.paidAmount,
    paymentMode: PAYMENT_MODE_LABELS[r.paymentMode],
    collectedBy: r.collectedBy,
    transactionId: r.transactionId ?? "",
    createdAt: formatDisplayDate(r.createdAt),
  }));

  const csv = toCsv(rows, [
    { key: "receiptNo", header: "Receipt No" },
    { key: "studentName", header: "Student" },
    { key: "admissionNo", header: "Admission No" },
    { key: "className", header: "Class" },
    { key: "feeTitle", header: "Fee" },
    { key: "paidAmount", header: "Amount Paid" },
    { key: "paymentMode", header: "Payment Mode" },
    { key: "collectedBy", header: "Collected By" },
    { key: "transactionId", header: "Transaction ID" },
    { key: "createdAt", header: "Date" },
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="receipts.csv"',
    },
  });
}
