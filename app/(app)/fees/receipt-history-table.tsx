"use client";

import * as React from "react";
import { ChevronRight, Printer } from "lucide-react";

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
import { EmptyState } from "@/components/ui/empty-state";
import { ExpandableDetailRow } from "@/components/ui/expandable-table";
import { ReceiptModal } from "@/components/fees/receipt-modal";
import { formatINR } from "@/lib/currency";
import {
  PAYMENT_MODE_BADGE_STYLES,
  PAYMENT_MODE_LABELS,
} from "@/lib/payment-mode";
import { cn } from "@/lib/utils";

import type { ReceiptRow, SchoolBranding } from "./types";

const COLUMN_COUNT = 9;

function ReceiptDetail({ receipt }: { receipt: ReceiptRow }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-xs text-muted-foreground">Fee Category</p>
        <p className="text-sm font-medium">{receipt.feeTitle}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Amount Paid</p>
        <p className="text-sm font-medium tabular-nums">
          {formatINR(receipt.paidAmount)}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Payment Method</p>
        <p className="text-sm font-medium">
          {PAYMENT_MODE_LABELS[receipt.paymentMode]}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Transaction ID</p>
        <p className="text-sm font-medium">
          {receipt.transactionId ?? "Not recorded"}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Collected By</p>
        <p className="text-sm font-medium">{receipt.collectedBy}</p>
      </div>
    </div>
  );
}

export function ReceiptHistoryTable({
  receipts,
  branding,
}: {
  receipts: ReceiptRow[];
  branding: SchoolBranding;
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [modalReceipt, setModalReceipt] = React.useState<ReceiptRow | null>(
    null,
  );

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
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
            receipts.map((r) => {
              const isExpanded = expandedId === r.id;
              return (
                <React.Fragment key={r.id}>
                  <AnimatedTableRow
                    className="cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  >
                    <TableCell>
                      <ChevronRight
                        className={cn(
                          "size-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-90",
                        )}
                      />
                    </TableCell>
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
                        className={`border-transparent ${PAYMENT_MODE_BADGE_STYLES[r.paymentMode]}`}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalReceipt(r);
                        }}
                      >
                        <Printer />
                        <span className="sr-only">View receipt</span>
                      </Button>
                    </TableCell>
                  </AnimatedTableRow>
                  <ExpandableDetailRow open={isExpanded} colSpan={COLUMN_COUNT}>
                    <ReceiptDetail receipt={r} />
                  </ExpandableDetailRow>
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="whitespace-normal text-center">
                <EmptyState compact title="No receipts yet" className="justify-center" />
              </TableCell>
            </TableRow>
          )}
        </AnimatedTableBody>
      </Table>

      <ReceiptModal
        receipt={modalReceipt}
        branding={branding}
        onOpenChange={(open) => {
          if (!open) setModalReceipt(null);
        }}
      />
    </div>
  );
}
