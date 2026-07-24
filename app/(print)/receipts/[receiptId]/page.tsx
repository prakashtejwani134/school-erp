import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatDisplayDateTime } from "@/lib/date";
import { formatINR } from "@/lib/currency";
import { PrintButton } from "./print-button";

const PAYMENT_MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  BANK_TRANSFER: "Bank Transfer",
};

async function getReceipt(receiptId: string) {
  return prisma.feeReceipt.findUnique({
    where: { id: receiptId },
    include: {
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
  const receipt = await getReceipt(receiptId);
  return { title: receipt ? `Receipt ${receipt.receiptNo}` : "Receipt not found" };
}

export default async function ReceiptPrintPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;
  const receipt = await getReceipt(receiptId);

  if (!receipt) notFound();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 print:p-0">
      <div className="flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-xl border p-8 print:rounded-none print:border-0">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h1 className="text-lg font-semibold">Greenwood School</h1>
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
              {PAYMENT_MODE_LABELS[receipt.paymentMode] ?? receipt.paymentMode}
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
