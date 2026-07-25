"use client";

import * as React from "react";
import { Download, Printer, Zap } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/currency";
import {
  PAYMENT_MODE_BADGE_STYLES,
  PAYMENT_MODE_LABELS,
} from "@/lib/payment-mode";
import { cn } from "@/lib/utils";

import { getStudentOutstandingBalance } from "@/app/(app)/fees/actions";
import type { ReceiptRow, SchoolBranding } from "@/app/(app)/fees/types";

export function ReceiptModal({
  receipt,
  branding,
  onOpenChange,
}: {
  receipt: ReceiptRow | null;
  branding: SchoolBranding;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(receipt)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Fee Receipt</DialogTitle>
          <DialogDescription>
            {receipt ? `Receipt ${receipt.receiptNo}` : "Receipt"}
          </DialogDescription>
        </DialogHeader>

        {receipt ? (
          <ReceiptModalBody
            key={receipt.id}
            receipt={receipt}
            branding={branding}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ReceiptModalBody({
  receipt,
  branding,
}: {
  receipt: ReceiptRow;
  branding: SchoolBranding;
}) {
  const [isThermal, setIsThermal] = React.useState(false);
  const [balance, setBalance] = React.useState<number | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const pendingPrintRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    getStudentOutstandingBalance(receipt.studentId).then((total) => {
      if (!cancelled) setBalance(total);
    });
    return () => {
      cancelled = true;
    };
  }, [receipt.studentId]);

  React.useEffect(() => {
    if (!pendingPrintRef.current) return;
    pendingPrintRef.current = false;
    const frame = requestAnimationFrame(() => window.print());
    return () => cancelAnimationFrame(frame);
  }, [isThermal]);

  function handlePrint(thermal: boolean) {
    if (isThermal !== thermal) {
      pendingPrintRef.current = true;
      setIsThermal(thermal);
    } else {
      window.print();
    }
  }

  async function handleExportPdf() {
    const node = document.getElementById("receipt-print-area");
    if (!node) return;

    setIsExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] =
        await Promise.all([import("html2canvas"), import("jspdf")]);

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imageData = canvas.toDataURL("image/png");

      const pdf = isThermal
        ? new jsPDF({
            unit: "mm",
            format: [80, (canvas.height * 80) / canvas.width],
          })
        : new jsPDF({ unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imageData, "PNG", 0, 0, pageWidth, imageHeight);
      pdf.save(`${receipt.receiptNo}.pdf`);
    } catch {
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <div
        id="receipt-print-area"
        className={cn(
          "rounded-lg border bg-background p-6 text-sm print:rounded-none print:border-0",
          isThermal && "mx-auto max-w-[80mm] p-3 text-[11px]",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b pb-3">
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- receipt is rasterized for PDF export, next/image adds no value here
              <img
                src={branding.logoUrl}
                alt=""
                className={cn(
                  "size-8 rounded object-cover",
                  isThermal && "size-6",
                )}
              />
            ) : null}
            <div>
              <p
                className={cn(
                  "font-semibold",
                  isThermal ? "text-xs" : "text-base",
                )}
              >
                {branding.schoolName}
              </p>
              {!isThermal && branding.address ? (
                <p className="text-xs text-muted-foreground">
                  {branding.address}
                </p>
              ) : null}
              {!isThermal && (branding.phone || branding.email) ? (
                <p className="text-xs text-muted-foreground">
                  {[branding.phone, branding.email].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "font-mono font-medium",
                isThermal ? "text-[10px]" : "text-sm",
              )}
            >
              {receipt.receiptNo}
            </p>
            <p className="text-xs text-muted-foreground">{receipt.createdAt}</p>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-3 border-b py-3",
            isThermal ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          <div>
            <p className="text-xs text-muted-foreground">Student</p>
            <p className="font-medium">{receipt.studentName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Roll No</p>
            <p className="font-medium">{receipt.admissionNo}</p>
          </div>
          {!isThermal ? (
            <div>
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-medium">{receipt.className}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <Badge
              className={cn(
                "border-transparent",
                PAYMENT_MODE_BADGE_STYLES[receipt.paymentMode],
              )}
            >
              {PAYMENT_MODE_LABELS[receipt.paymentMode]}
            </Badge>
          </div>
        </div>

        <table className="w-full py-3">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-1.5 font-normal">Description</th>
              <th className="py-1.5 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1.5">{receipt.feeTitle}</td>
              <td className="py-1.5 text-right tabular-nums">
                {formatINR(receipt.paidAmount)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t font-medium">
              <td className="py-1.5">Total Paid</td>
              <td className="py-1.5 text-right tabular-nums">
                {formatINR(receipt.paidAmount)}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-muted-foreground">
                Balance Remaining
              </td>
              <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                {balance === null ? "…" : formatINR(balance)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="border-t pt-3 text-center text-[10px] text-muted-foreground">
          This is a computer-generated receipt and does not require a
          signature.
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={() => handlePrint(true)}>
          <Zap />
          Thermal Receipt
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPdf}
          disabled={isExporting}
        >
          <Download />
          {isExporting ? "Exporting..." : "Export PDF"}
        </Button>
        <Button onClick={() => handlePrint(false)}>
          <Printer />
          Print Receipt
        </Button>
      </div>
    </>
  );
}
