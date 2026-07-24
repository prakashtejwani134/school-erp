"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import { createStudent, updateStudent } from "./actions";
import type { ClassOption, StudentRow } from "./types";

export function StudentFormDialog({
  open,
  onOpenChange,
  classes,
  student,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
  student: StudentRow | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const isEditing = Boolean(student);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (student) {
          await updateStudent(student.id, formData);
          toast.success("Student updated");
        } else {
          await createStudent(formData);
          toast.success("Student added");
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
      <DialogContent className="sm:max-w-md">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Student" : "Add Student"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this student's details."
                : "Enter the new student's details below."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={student?.firstName}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={student?.lastName}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admissionNo">Admission No</Label>
              <Input
                id="admissionNo"
                name="admissionNo"
                defaultValue={student?.admissionNo}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                defaultValue={student?.parentPhone}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="classId">Class</Label>
              <Select
                key={student?.id ?? "new"}
                name="classId"
                defaultValue={student?.classId}
                required
              >
                <SelectTrigger id="classId" className="w-full">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}-{c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isDiscounted"
                name="isDiscounted"
                defaultChecked={student?.isDiscounted}
              />
              <Label htmlFor="isDiscounted" className="font-normal">
                Fee discount applies
              </Label>
            </div>

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
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
