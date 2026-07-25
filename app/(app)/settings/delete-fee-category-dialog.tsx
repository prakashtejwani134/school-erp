"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { deleteFeeCategoryRule } from "./actions";
import type { FeeCategoryRuleRow } from "./types";

export function DeleteFeeCategoryDialog({
  rule,
  onOpenChange,
}: {
  rule: FeeCategoryRuleRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleConfirm(event: React.MouseEvent) {
    event.preventDefault();
    if (!rule) return;
    startTransition(async () => {
      try {
        await deleteFeeCategoryRule(rule.id);
        toast.success("Fee category deleted");
        onOpenChange(false);
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to delete fee category.",
        );
      }
    });
  }

  return (
    <AlertDialog open={Boolean(rule)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete fee category?</AlertDialogTitle>
          <AlertDialogDescription>
            {rule
              ? `This will permanently remove "${rule.name}". This can't be undone.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
