"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { FeeFrequency } from "@prisma/client";

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

import { createFeeCategoryRule, updateFeeCategoryRule } from "./actions";
import type { FeeCategoryRuleRow } from "./types";

const FREQUENCY_OPTIONS: { value: FeeFrequency; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUALLY", label: "Annually" },
];

export function FeeCategoryDialog({
  open,
  onOpenChange,
  schoolSettingsId,
  rule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolSettingsId: string;
  rule: FeeCategoryRuleRow | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [frequency, setFrequency] = React.useState<FeeFrequency>(
    rule?.frequency ?? "MONTHLY",
  );
  const isEditing = Boolean(rule);

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("frequency", frequency);
    startTransition(async () => {
      try {
        if (rule) {
          await updateFeeCategoryRule(rule.id, formData);
          toast.success("Fee category updated");
        } else {
          await createFeeCategoryRule(schoolSettingsId, formData);
          toast.success("Fee category added");
        }
        onOpenChange(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit fee category" : "Add fee category"}
            </DialogTitle>
            <DialogDescription>
              Define a recurring fee category and its late payment penalty.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Category name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Tuition Fee"
                defaultValue={rule?.name}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={rule?.amount}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={frequency}
                  onValueChange={(value) =>
                    value && setFrequency(value as FeeFrequency)
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lateFeePercentage">Late fee (%)</Label>
              <Input
                id="lateFeePercentage"
                name="lateFeePercentage"
                type="number"
                step="0.01"
                min="0"
                defaultValue={rule?.lateFeePercentage ?? 0}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
