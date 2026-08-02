"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SealBadge } from "@/components/ui/seal-badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/currency";
import { PAYMENT_MODE_LABELS } from "@/lib/payment-mode";
import type { FinancialHubData } from "./financial-hub-data";

// Read+navigate view only — actually collecting a payment is pay-fee-sheet.tsx's
// job, not duplicated here. Reuses components/ui/sheet.tsx directly, which
// already bakes in the same SHEET_SPRING physics every other Sheet gets.
export function FinancialHubSheet({
  open,
  onOpenChange,
  studentName,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  data: FinancialHubData;
}) {
  const { totalFeeDue, categoryBreakdown, receipts } = data;
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "w-full sm:max-w-md",
          isMobile && "max-h-[85vh] rounded-t-xl",
        )}
      >
        <SheetHeader>
          <SheetTitle>Financial Hub — {studentName}</SheetTitle>
          <SheetDescription>
            Outstanding fees and payment history in one place.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatINR(totalFeeDue)}
            </p>

            {categoryBreakdown.length > 0 ? (
              <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
                {categoryBreakdown.map((c) => (
                  <div
                    key={c.title}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{c.title}</span>
                    <span className="font-medium tabular-nums">
                      {formatINR(c.remainingAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* TODO: wire up real PDF generation once a utility/library is
              chosen — no PDF pipeline exists in this codebase yet (only a
              static, unrelated operational-guide.pdf asset). */}
          <Button
            size="sm"
            variant="outline"
            disabled
            title="Coming soon"
            className="h-11 md:h-7"
          >
            <Download />
            Download Fee Challan (PDF)
          </Button>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Payment History</p>
            {receipts.length === 0 ? (
              <EmptyState compact title="No payments recorded yet" className="justify-start" />
            ) : (
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {receipts.map((r, index) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {index === 0 ? (
                        <SealBadge label="Paid" size={32} className="shrink-0" />
                      ) : null}
                      <span>
                        <span className="font-medium">{r.feeTitle}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.createdAt} · {PAYMENT_MODE_LABELS[r.paymentMode]}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-medium tabular-nums">
                        {formatINR(r.paidAmount)}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="max-md:size-11"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/receipts/${r.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <Download className="size-3.5" />
                        <span className="sr-only">
                          Download receipt {r.receiptNo}
                        </span>
                      </Button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
