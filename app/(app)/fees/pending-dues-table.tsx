"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedTableBody, AnimatedTableRow } from "@/components/motion/table-row";
import { WhatsAppReminderButton } from "@/components/fees/whatsapp-reminder-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatINR } from "@/lib/currency";
import type { DefaulterRisk } from "@/lib/analytics/defaulters";

import type { PendingDueRow } from "./types";

// LOW stays unbadged — the badge exists to draw the eye to dues that need
// attention, not to label every row.
const RISK_BADGE: Partial<Record<DefaulterRisk, { label: string; className: string }>> = {
  MEDIUM: {
    label: "Medium risk",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  HIGH: {
    label: "High risk",
    className: "bg-red-500/15 text-red-700 dark:text-red-400",
  },
};

export function PendingDuesTable({
  dues,
  schoolName,
  onCollect,
}: {
  dues: PendingDueRow[];
  schoolName: string;
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
            <TableHead className="text-right">Remind</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <AnimatedTableBody>
          {dues.length ? (
            dues.map((due) => (
              <AnimatedTableRow key={due.id}>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{due.studentName}</span>
                    {RISK_BADGE[due.risk] ? (
                      <Badge
                        className={`border-transparent text-[10px] ${RISK_BADGE[due.risk]!.className}`}
                      >
                        {RISK_BADGE[due.risk]!.label}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {due.admissionNo}
                  </span>
                </TableCell>
                <TableCell>{due.className}</TableCell>
                <TableCell>{due.feeTitle}</TableCell>
                <TableCell>{due.dueDate}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <span>{formatINR(due.remainingAmount)}</span>
                  {due.amountPaid > 0 ? (
                    <Badge
                      variant="secondary"
                      className="ml-2 align-middle text-[10px]"
                    >
                      {formatINR(due.amountPaid)} paid
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-right">
                  <WhatsAppReminderButton
                    parentPhone={due.parentPhone}
                    studentName={due.studentName}
                    feeTitle={due.feeTitle}
                    dueAmount={due.remainingAmount}
                    dueDate={due.dueDate}
                    schoolName={schoolName}
                  />
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
              <TableCell colSpan={7} className="whitespace-normal text-center">
                <EmptyState
                  compact
                  title="All caught up"
                  description="No pending dues right now."
                  className="justify-center"
                />
              </TableCell>
            </TableRow>
          )}
        </AnimatedTableBody>
      </Table>
    </div>
  );
}
