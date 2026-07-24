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

import { deleteStudent } from "./actions";
import type { StudentRow } from "./types";

export function DeleteStudentDialog({
  student,
  onOpenChange,
}: {
  student: StudentRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleConfirm(event: React.MouseEvent) {
    event.preventDefault();
    if (!student) return;
    startTransition(async () => {
      try {
        await deleteStudent(student.id);
        toast.success("Student deleted");
        onOpenChange(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete student.");
      }
    });
  }

  return (
    <AlertDialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete student?</AlertDialogTitle>
          <AlertDialogDescription>
            {student
              ? `This will permanently remove ${student.firstName} ${student.lastName} (${student.admissionNo}). This can't be undone.`
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
