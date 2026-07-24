"use client";

import * as React from "react";
import { toast } from "sonner";
import type { PaymentMode } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { collectFee, getStudentDues } from "./actions";
import type { StudentDue, StudentOption } from "./types";

const PAYMENT_MODE_OPTIONS: { value: PaymentMode; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
];

const REFERENCE_REQUIRED: PaymentMode[] = ["UPI"];

export function CollectFeeDialog({
  open,
  onOpenChange,
  students,
  defaultCollectedBy,
  initialStudentId,
  initialFeeDueId,
  onCollected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentOption[];
  defaultCollectedBy: string;
  initialStudentId?: string;
  initialFeeDueId?: string;
  onCollected: (receiptId: string) => void;
}) {
  const [studentId, setStudentId] = React.useState(initialStudentId ?? "");
  const [dues, setDues] = React.useState<StudentDue[]>([]);
  const [duesLoading, setDuesLoading] = React.useState(false);
  const [feeDueId, setFeeDueId] = React.useState(initialFeeDueId ?? "");
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
        setFeeDueId(
          preselect && result.some((d) => d.id === preselect)
            ? preselect
            : (result[0]?.id ?? ""),
        );
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
    // Runs once per mount — the parent remounts this dialog (via key) on every open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStudentChange(value: string) {
    setStudentId(value);
    setError(null);
    loadDues(value);
  }

  const referenceRequired = REFERENCE_REQUIRED.includes(paymentMode);
  const selectedDue = dues.find((d) => d.id === feeDueId) ?? null;

  function handleSubmit() {
    setError(null);
    if (!feeDueId) {
      setError("Select a pending due to collect.");
      return;
    }
    if (referenceRequired && !transactionId.trim()) {
      setError("Transaction ID is required for this payment mode.");
      return;
    }
    startTransition(async () => {
      try {
        const { receiptId, receiptNo } = await collectFee({
          feeDueId,
          paymentMode,
          transactionId,
          collectedBy,
        });
        toast.success(`Fee collected — receipt ${receiptNo}`);
        onOpenChange(false);
        onCollected(receiptId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Fee</DialogTitle>
          <DialogDescription>
            Select a student to view their pending dues and record a payment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
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
                          onChange={() => setFeeDueId(due.id)}
                          className="accent-primary"
                        />
                        <span>
                          <span className="font-medium">{due.feeTitle}</span>
                          <span className="block text-xs text-muted-foreground">
                            Due {due.dueDate}
                          </span>
                        </span>
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatINR(due.dueAmount)}
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
                      {PAYMENT_MODE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={formatINR(selectedDue.dueAmount)}
                    disabled
                  />
                </div>
              </div>

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

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
