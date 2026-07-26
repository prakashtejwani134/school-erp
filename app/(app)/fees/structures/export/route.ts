import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { toCsv } from "@/lib/csv";
import { getActiveSchoolContext } from "@/lib/school-context";

export async function GET() {
  const context = await getActiveSchoolContext();
  if (!context) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Exports the per-student fee-due ledger (every assigned due, paid or
  // pending) rather than the bare FeeStructure catalog — this is the more
  // useful "fee structures for students" view.
  const dues = await prisma.feeDue.findMany({
    where: { schoolId: context.schoolId },
    include: { student: { include: { class: true } }, feeStructure: true },
    orderBy: [{ feeStructure: { dueDate: "asc" } }],
  });

  const rows = dues.map((due) => ({
    studentName: `${due.student.firstName} ${due.student.lastName}`,
    admissionNo: due.student.admissionNo,
    className: `${due.student.class.name}-${due.student.class.section}`,
    feeTitle: due.feeStructure.title,
    totalAmount: due.dueAmount,
    amountPaid: due.amountPaid,
    remainingAmount: due.dueAmount - due.amountPaid,
    dueDate: formatDisplayDate(due.feeStructure.dueDate),
    status: due.isPaid ? "Paid" : "Pending",
  }));

  const csv = toCsv(rows, [
    { key: "studentName", header: "Student" },
    { key: "admissionNo", header: "Admission No" },
    { key: "className", header: "Class" },
    { key: "feeTitle", header: "Fee" },
    { key: "totalAmount", header: "Total Amount" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "remainingAmount", header: "Remaining Amount" },
    { key: "dueDate", header: "Due Date" },
    { key: "status", header: "Status" },
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fee-structures.csv"',
    },
  });
}
