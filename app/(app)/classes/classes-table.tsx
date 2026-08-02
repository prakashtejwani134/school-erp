"use client";

import { Users } from "lucide-react";

import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedTableBody, AnimatedTableRow } from "@/components/motion/table-row";
import { EmptyState } from "@/components/ui/empty-state";

import type { ClassRow } from "./types";

export function ClassesTable({ classes }: { classes: ClassRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Section</TableHead>
            <TableHead className="text-right">Students</TableHead>
          </TableRow>
        </TableHeader>
        <AnimatedTableBody>
          {classes.length ? (
            classes.map((c) => (
              <AnimatedTableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.section}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-3.5" />
                    {c.studentCount}
                  </span>
                </TableCell>
              </AnimatedTableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="whitespace-normal text-center">
                <EmptyState
                  title="No classes yet"
                  description="Classes are set up by the school during onboarding — reach out if one's missing."
                />
              </TableCell>
            </TableRow>
          )}
        </AnimatedTableBody>
      </Table>
    </div>
  );
}
