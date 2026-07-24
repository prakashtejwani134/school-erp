"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedTableBody, AnimatedTableRow } from "@/components/motion/table-row";
import { formatINR } from "@/lib/currency";

import type { PendingDueRow } from "./types";

export function PendingDuesTable({
  dues,
  onCollect,
}: {
  dues: PendingDueRow[];
  onCollect: (due: PendingDueRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <AnimatedTableBody>
          {dues.length ? (
            dues.map((due) => (
              <AnimatedTableRow key={due.id}>
                <TableCell>
                  <span className="font-medium">{due.studentName}</span>
                  <span className="block text-xs text-muted-foreground">
                    {due.admissionNo}
                  </span>
                </TableCell>
                <TableCell>{due.className}</TableCell>
                <TableCell>{due.feeTitle}</TableCell>
                <TableCell>{due.dueDate}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatINR(due.dueAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => onCollect(due)}>
                    Collect
                  </Button>
                </TableCell>
              </AnimatedTableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No pending dues. All caught up.
              </TableCell>
            </TableRow>
          )}
        </AnimatedTableBody>
      </Table>
    </div>
  );
}
