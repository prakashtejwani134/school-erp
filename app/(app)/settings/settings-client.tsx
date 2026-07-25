"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { saveSchoolSettings } from "./actions";
import { DeleteFeeCategoryDialog } from "./delete-fee-category-dialog";
import { FeeCategoryDialog } from "./fee-category-dialog";
import type { FeeCategoryRuleRow, SchoolSettingsData } from "./types";

const FREQUENCY_LABELS: Record<FeeCategoryRuleRow["frequency"], string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUALLY: "Annually",
};

function SchoolDetailsForm({
  schoolSettings,
}: {
  schoolSettings: SchoolSettingsData | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveSchoolSettings(schoolSettings?.id ?? null, formData);
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
  schoolSettingsId,
  feeCategories,
}: {
  schoolSettingsId: string | null;
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
        <Button
          size="sm"
          onClick={() => openDialog(null)}
          disabled={!schoolSettingsId}
        >
          <Plus />
          Add category
        </Button>
      </CardHeader>
      <CardContent>
        {!schoolSettingsId ? (
          <p className="text-sm text-muted-foreground">
            Save your school details first to start adding fee categories.
          </p>
        ) : (
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
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No fee categories yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {schoolSettingsId ? (
        <FeeCategoryDialog
          key={dialogKey}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          schoolSettingsId={schoolSettingsId}
          rule={editingRule}
        />
      ) : null}

      <DeleteFeeCategoryDialog
        rule={deletingRule}
        onOpenChange={(open) => {
          if (!open) setDeletingRule(null);
        }}
      />
    </Card>
  );
}

export function SettingsClient({
  schoolSettings,
  feeCategories,
}: {
  schoolSettings: SchoolSettingsData | null;
  feeCategories: FeeCategoryRuleRow[];
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <SchoolDetailsForm schoolSettings={schoolSettings} />
      <FeeCategoriesCard
        schoolSettingsId={schoolSettings?.id ?? null}
        feeCategories={feeCategories}
      />
    </div>
  );
}
