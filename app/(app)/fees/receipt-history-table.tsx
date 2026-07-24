"use client";

import { Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedTableBody, AnimatedTableRow } from "@/components/motion/table-row";
import { formatINR } from "@/lib/currency";

import type { ReceiptRow } from "./types";

const PAYMENT_MODE_STYLES: Record<ReceiptRow["paymentMode"], string> = {
  CASH: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  UPI: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  CHEQUE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  BANK_TRANSFER: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};

const PAYMENT_MODE_LABELS: Record<ReceiptRow["paymentMode"], string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  BANK_TRANSFER: "Bank Transfer",
};

export function ReceiptHistoryTable({ receipts }: { receipts: ReceiptRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt No</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Collected By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <AnimatedTableBody>
          {receipts.length ? (
            receipts.map((r) => (
              <AnimatedTableRow key={r.id}>
                <TableCell className="font-mono text-xs">
                  {r.receiptNo}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{r.studentName}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.admissionNo} · {r.className}
                  </span>
                </TableCell>
                <TableCell>{r.feeTitle}</TableCell>
                <TableCell>
                  <Badge
                    className={`border-transparent ${PAYMENT_MODE_STYLES[r.paymentMode]}`}
                  >
                    {PAYMENT_MODE_LABELS[r.paymentMode]}
                  </Badge>
                </TableCell>
                <TableCell>{r.collectedBy}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatINR(r.paidAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    render={
                      <a
                        href={`/receipts/${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Printer />
                    <span className="sr-only">Print receipt</span>
                  </Button>
                </TableCell>
              </AnimatedTableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                No receipts yet.
              </TableCell>
            </TableRow>
          )}
        </AnimatedTableBody>
      </Table>
    </div>
  );
}
