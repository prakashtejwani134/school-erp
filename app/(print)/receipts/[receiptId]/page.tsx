import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatDisplayDateTime } from "@/lib/date";
import { formatINR } from "@/lib/currency";
import { PAYMENT_MODE_LABELS } from "@/lib/payment-mode";
import { canAccess } from "@/lib/rbac";
import { getActiveSchoolContext } from "@/lib/school-context";
import { PrintButton } from "./print-button";

/** Scoped to the caller's active school — a receipt id from another tenant resolves to nothing, not someone else's data. */
async function getReceipt(receiptId: string, schoolId: string) {
  return prisma.feeReceipt.findFirst({
    where: { id: receiptId, schoolId },
    include: {
      school: true,
      student: { include: { class: true } },
      feeDue: { include: { feeStructure: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}): Promise<Metadata> {
  const { receiptId } = await params;
  const context = await getActiveSchoolContext();
  if (!context) return { title: "Receipt" };
  const receipt = await getReceipt(receiptId, context.schoolId);
  return { title: receipt ? `Receipt ${receipt.receiptNo}` : "Receipt not found" };
}

export default async function ReceiptPrintPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;
  const context = await getActiveSchoolContext();
  if (!context) redirect("/login");

  const receipt = await getReceipt(receiptId, context.schoolId);
  if (!receipt) notFound();

  // Staff with fee-collection access can view any receipt at their school;
  // a parent may only view their own child's — this never opens receipts
  // up to parents at large, and staff access is unchanged from before.
  const isStaff = canAccess(context.role, "fees");
  const isGuardian =
    context.role === "PARENT" && receipt.student.guardianId === context.userId;
  if (!isStaff && !isGuardian) {
    redirect(context.role === "PARENT" ? "/parent" : "/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 print:p-0">
      <div className="flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div
        id="receipt-print-area"
        className="rounded-xl border p-8 print:rounded-none print:border-0"
      >
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h1 className="text-lg font-semibold">{receipt.school.schoolName}</h1>
            <p className="text-sm text-muted-foreground">Fee Receipt</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono font-medium">{receipt.receiptNo}</p>
            <p className="text-muted-foreground">
              {formatDisplayDateTime(receipt.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b py-4 text-sm">
          <div>
            <p className="text-muted-foreground">Student</p>
            <p className="font-medium">
              {receipt.student.firstName} {receipt.student.lastName}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Class</p>
            <p className="font-medium">
              {receipt.student.class.name}-{receipt.student.class.section}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Admission No</p>
            <p className="font-medium">{receipt.student.admissionNo}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment Mode</p>
            <p className="font-medium">
              {PAYMENT_MODE_LABELS[receipt.paymentMode]}
            </p>
          </div>
          {receipt.transactionId ? (
            <div>
              <p className="text-muted-foreground">Reference No.</p>
              <p className="font-medium">{receipt.transactionId}</p>
            </div>
          ) : null}
          <div>
            <p className="text-muted-foreground">Collected By</p>
            <p className="font-medium">{receipt.collectedBy}</p>
          </div>
        </div>

        <table className="w-full py-4 text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 font-normal">Description</th>
              <th className="py-2 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">{receipt.feeDue.feeStructure.title}</td>
              <td className="py-2 text-right tabular-nums">
                {formatINR(receipt.paidAmount)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t font-medium">
              <td className="py-2">Total Paid</td>
              <td className="py-2 text-right tabular-nums">
                {formatINR(receipt.paidAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="border-t pt-4 text-center text-xs text-muted-foreground">
          This is a computer-generated receipt and does not require a
          signature.
        </p>
      </div>
    </div>
  );
}
