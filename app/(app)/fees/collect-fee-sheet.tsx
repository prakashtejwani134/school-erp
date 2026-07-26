"use client";

import * as React from "react";
import { toast } from "sonner";
import type { PaymentMode } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/currency";
import { PAYMENT_MODE_LABELS } from "@/lib/payment-mode";

import { getStudentDues } from "./actions";
import type { CollectFeeInput, CollectFeeResult } from "./actions";
import type { StudentDue, StudentOption } from "./types";

const REFERENCE_REQUIRED: PaymentMode[] = ["UPI"];
const AMOUNT_EPSILON = 0.01;

export function CollectFeeSheet({
  open,
  onOpenChange,
  students,
  defaultCollectedBy,
  initialStudentId,
  initialFeeDueId,
  onCollect,
  onCollected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentOption[];
  defaultCollectedBy: string;
  initialStudentId?: string;
  initialFeeDueId?: string;
  onCollect: (input: CollectFeeInput) => Promise<CollectFeeResult>;
  onCollected: (receiptId: string) => void;
}) {
  const [studentId, setStudentId] = React.useState(initialStudentId ?? "");
  const [dues, setDues] = React.useState<StudentDue[]>([]);
  const [duesLoading, setDuesLoading] = React.useState(false);
  const [feeDueId, setFeeDueId] = React.useState(initialFeeDueId ?? "");
  const [amount, setAmount] = React.useState("");
  const [paymentMode, setPaymentMode] = React.useState<PaymentMode>("CASH");
  const [transactionId, setTransactionId] = React.useState("");
  const [collectedBy, setCollectedBy] = React.useState(defaultCollectedBy);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const loadDues = React.useCallback(
    async (id: string, preselect?: string) => {
      if (!id) {
        setDues([]);
        setFeeDueId("");
        return;
      }
      setDuesLoading(true);
      try {
        const result = await getStudentDues(id);
        setDues(result);
        const selected =
          preselect && result.some((d) => d.id === preselect)
            ? preselect
            : (result[0]?.id ?? "");
        setFeeDueId(selected);
        const selectedDue = result.find((d) => d.id === selected);
        setAmount(selectedDue ? String(selectedDue.remainingAmount) : "");
      } catch {
        toast.error("Failed to load dues for this student.");
        setDues([]);
        setFeeDueId("");
      } finally {
        setDuesLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (initialStudentId) {
      // Fetching from the server on mount, not deriving state from props.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDues(initialStudentId, initialFeeDueId);
    }
    // Runs once per mount — the parent remounts this sheet (via key) on every open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStudentChange(value: string) {
    setStudentId(value);
    setError(null);
    loadDues(value);
  }

  function handleDueChange(id: string) {
    setFeeDueId(id);
    setError(null);
    const selectedDue = dues.find((d) => d.id === id);
    setAmount(selectedDue ? String(selectedDue.remainingAmount) : "");
  }

  const referenceRequired = REFERENCE_REQUIRED.includes(paymentMode);
  const selectedDue = dues.find((d) => d.id === feeDueId) ?? null;
  const amountValue = Number(amount);
  const isPartial =
    selectedDue !== null && amountValue > 0
      ? amountValue < selectedDue.remainingAmount - AMOUNT_EPSILON
      : false;

  function handleSubmit() {
    setError(null);
    if (!feeDueId || !selectedDue) {
      setError("Select a pending due to collect.");
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    if (amountValue > selectedDue.remainingAmount + AMOUNT_EPSILON) {
      setError(
        `Amount can't exceed the remaining due of ${formatINR(selectedDue.remainingAmount)}.`,
      );
      return;
    }
    if (referenceRequired && !transactionId.trim()) {
      setError("Transaction ID is required for this payment mode.");
      return;
    }
    startTransition(async () => {
      try {
        const { receiptId, receiptNo, remainingAmount, isFullyPaid } =
          await onCollect({
            feeDueId,
            amount: amountValue,
            paymentMode,
            transactionId,
            collectedBy,
          });
        toast.success(
          isFullyPaid
            ? `Fee collected — receipt ${receiptNo}`
            : `Partial payment recorded — receipt ${receiptNo} (${formatINR(remainingAmount)} remaining)`,
        );
        onOpenChange(false);
        onCollected(receiptId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Collect Fee</SheetTitle>
          <SheetDescription>
            Select a student to view their pending dues and record a payment.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <div className="grid gap-2">
            <Label htmlFor="student">Student</Label>
            <Select
              value={studentId}
              onValueChange={(value) => value && handleStudentChange(value)}
            >
              <SelectTrigger id="student" className="w-full">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.admissionNo} ({s.className})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {studentId ? (
            <div className="grid gap-2">
              <Label>Pending Dues</Label>
              {duesLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading dues...
                </p>
              ) : dues.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This student has no pending dues.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dues.map((due) => (
                    <label
                      key={due.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                        feeDueId === due.id
                          ? "border-primary bg-primary/5"
                          : "border-input"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="feeDueId"
                          value={due.id}
                          checked={feeDueId === due.id}
                          onChange={() => handleDueChange(due.id)}
                          className="accent-primary"
                        />
                        <span>
                          <span className="font-medium">{due.feeTitle}</span>
                          <span className="block text-xs text-muted-foreground">
                            Due {due.dueDate}
                            {due.amountPaid > 0
                              ? ` · ${formatINR(due.amountPaid)} already paid`
                              : ""}
                          </span>
                        </span>
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatINR(due.remainingAmount)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {selectedDue ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select
                    value={paymentMode}
                    onValueChange={(value) =>
                      value && setPaymentMode(value as PaymentMode)
                    }
                  >
                    <SelectTrigger id="paymentMode" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(PAYMENT_MODE_LABELS) as [
                          PaymentMode,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">
                    Amount
                    <span className="text-muted-foreground">
                      {" "}
                      (of {formatINR(selectedDue.remainingAmount)})
                    </span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    inputMode="decimal"
                    min={0.01}
                    max={selectedDue.remainingAmount}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {isPartial ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Partial payment — {formatINR(selectedDue.remainingAmount - amountValue)}{" "}
                  will remain due after this payment.
                </p>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="transactionId">
                  {paymentMode === "CHEQUE" ? "Cheque No." : "Transaction ID"}
                  {referenceRequired ? null : (
                    <span className="text-muted-foreground"> (optional)</span>
                  )}
                </Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={
                    paymentMode === "CHEQUE" ? "e.g. 004521" : "e.g. TXN123456"
                  }
                  required={referenceRequired}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="collectedBy">Collected By</Label>
                <Input
                  id="collectedBy"
                  value={collectedBy}
                  onChange={(e) => setCollectedBy(e.target.value)}
                  required
                />
              </div>
            </>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <SheetFooter className="flex-row justify-end border-t bg-muted/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !selectedDue}
          >
            {isPending ? "Collecting..." : "Collect & Generate Receipt"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
