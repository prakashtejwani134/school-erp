"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatINR } from "@/lib/currency";
import type { FeeDueRow } from "../data";

// Read-only fee breakdown for now — online checkout isn't wired up to a
// payment provider yet, so this doesn't attempt to collect a payment itself.
// Reuses components/ui/sheet.tsx directly, which already bakes in the same
// SHEET_SPRING physics collect-fee-sheet.tsx uses — nothing to duplicate.
export function PayFeeSheet({
  open,
  onOpenChange,
  studentName,
  feeDues,
  totalFeeDue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  feeDues: FeeDueRow[];
  totalFeeDue: number;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Pending Fee — {studentName}</SheetTitle>
          <SheetDescription>
            Online payment isn&apos;t available yet — please pay at the school
            office.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2 overflow-y-auto px-4">
          {feeDues.map((due) => (
            <div
              key={due.id}
              className="flex items-center justify-between rounded-lg border border-input px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{due.title}</span>
                <span className="block text-xs text-muted-foreground">
                  Due {due.dueDate}
                </span>
              </span>
              <span className="font-medium tabular-nums">
                {formatINR(due.remainingAmount)}
              </span>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between border-t pt-3 text-sm font-medium">
            <span>Total Due</span>
            <span className="tabular-nums">{formatINR(totalFeeDue)}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
