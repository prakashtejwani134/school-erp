"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/currency";

import { createSubject, deleteSubject, saveSchoolSettings } from "./actions";
import { DeleteFeeCategoryDialog } from "./delete-fee-category-dialog";
import { FeeCategoryDialog } from "./fee-category-dialog";
import type {
  FeeCategoryRuleRow,
  SchoolSettingsData,
  SubjectRow,
} from "./types";

const FREQUENCY_LABELS: Record<FeeCategoryRuleRow["frequency"], string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUALLY: "Annually",
};

function SchoolDetailsForm({
  schoolSettings,
}: {
  schoolSettings: SchoolSettingsData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveSchoolSettings(formData);
        toast.success("School details saved");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle>School details</CardTitle>
          <CardDescription>
            Shown across receipts, reports, and the app header.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="schoolName">School name</Label>
              <Input
                id="schoolName"
                name="schoolName"
                defaultValue={schoolSettings?.schoolName ?? ""}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                placeholder="https://..."
                defaultValue={schoolSettings?.logoUrl ?? ""}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={schoolSettings?.address ?? ""}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={schoolSettings?.phone ?? ""}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={schoolSettings?.email ?? ""}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                placeholder="INR"
                defaultValue={schoolSettings?.currency ?? "INR"}
                required
              />
            </div>
          </div>
          <div className="grid gap-1.5 sm:w-64">
            <Label htmlFor="currentAcademicYear">Current academic year</Label>
            <Input
              id="currentAcademicYear"
              name="currentAcademicYear"
              placeholder="2026-2027"
              defaultValue={schoolSettings?.currentAcademicYear ?? ""}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save details"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function FeeCategoriesCard({
  feeCategories,
}: {
  feeCategories: FeeCategoryRuleRow[];
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogKey, setDialogKey] = React.useState(0);
  const [editingRule, setEditingRule] = React.useState<FeeCategoryRuleRow | null>(
    null,
  );
  const [deletingRule, setDeletingRule] = React.useState<FeeCategoryRuleRow | null>(
    null,
  );

  function openDialog(rule: FeeCategoryRuleRow | null) {
    setEditingRule(rule);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Fee categories</CardTitle>
          <CardDescription>
            Recurring fee rules used when generating dues.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => openDialog(null)}>
          <Plus />
          Add category
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Late fee</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeCategories.length ? (
                feeCategories.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{FREQUENCY_LABELS[rule.frequency]}</TableCell>
                    <TableCell>{rule.lateFeePercentage}%</TableCell>
                    <TableCell className="text-right">
                      {formatINR(rule.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(rule)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingRule(rule)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="whitespace-normal text-center">
                    <EmptyState
                      title="No fee categories yet"
                      description="Add a fee category to start generating dues for students."
                      action={
                        <Button size="sm" onClick={() => openDialog(null)}>
                          <Plus />
                          Add category
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <FeeCategoryDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
      />

      <DeleteFeeCategoryDialog
        rule={deletingRule}
        onOpenChange={(open) => {
          if (!open) setDeletingRule(null);
        }}
      />
    </Card>
  );
}

function SubjectsCard({ subjects }: { subjects: SubjectRow[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [deletingSubject, setDeletingSubject] = React.useState<SubjectRow | null>(
    null,
  );
  const [isAdding, startAdding] = React.useTransition();
  const [isDeleting, startDeleting] = React.useTransition();

  function handleAdd() {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Subject name is required.");
      return;
    }
    startAdding(async () => {
      try {
        const formData = new FormData();
        formData.set("name", trimmed);
        await createSubject(formData);
        toast.success("Subject added");
        setName("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function handleDelete() {
    if (!deletingSubject) return;
    startDeleting(async () => {
      try {
        await deleteSubject(deletingSubject.id);
        toast.success("Subject deleted");
        setDeletingSubject(null);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete subject.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subjects</CardTitle>
        <CardDescription>
          Used when entering exam marks — add every subject taught at the
          school.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Mathematics"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button onClick={handleAdd} disabled={isAdding}>
            <Plus />
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {subjects.length ? (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Badge
                key={subject.id}
                className="gap-1.5 border-transparent bg-muted pr-1 text-foreground"
              >
                {subject.name}
                <button
                  type="button"
                  onClick={() => setDeletingSubject(subject)}
                  className="rounded-full p-0.5 hover:bg-background/60"
                  aria-label={`Delete ${subject.name}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <EmptyState compact title="No subjects yet" />
        )}
      </CardContent>

      <AlertDialog
        open={Boolean(deletingSubject)}
        onOpenChange={(open) => {
          if (!open) setDeletingSubject(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingSubject
                ? `This will permanently remove "${deletingSubject.name}". This can't be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function SettingsClient({
  schoolSettings,
  feeCategories,
  subjects,
}: {
  schoolSettings: SchoolSettingsData;
  feeCategories: FeeCategoryRuleRow[];
  subjects: SubjectRow[];
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <SchoolDetailsForm schoolSettings={schoolSettings} />
      <SubjectsCard subjects={subjects} />
      <FeeCategoriesCard feeCategories={feeCategories} />
    </div>
  );
}
