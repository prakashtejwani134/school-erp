"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AUDIT_ACTION_BADGE_STYLES, AUDIT_ACTION_LABELS } from "@/lib/audit-labels";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/date";
import { getInitials } from "@/lib/utils";

import type { AuditLogEntry } from "./types";

function SortButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={onClick}>
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  );
}

export function getColumns(): ColumnDef<AuditLogEntry>[] {
  return [
    {
      id: "user",
      accessorFn: (row) => row.userName,
      header: ({ column }) => (
        <SortButton
          label="User"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {getInitials(row.original.userName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.userName}</span>
        </div>
      ),
    },
    {
      id: "actionType",
      accessorFn: (row) => row.actionType,
      header: "Action",
      cell: ({ row }) => (
        <Badge
          className={`border-transparent ${AUDIT_ACTION_BADGE_STYLES[row.original.actionType]}`}
        >
          {AUDIT_ACTION_LABELS[row.original.actionType]}
        </Badge>
      ),
    },
    {
      id: "targetEntity",
      accessorFn: (row) => row.targetEntity,
      header: "Target",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.targetEntity}
        </span>
      ),
    },
    {
      id: "details",
      accessorFn: (row) => row.details,
      header: "Details",
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue<string>()}</span>
      ),
    },
    {
      id: "createdAt",
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <SortButton
          label="Time"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ getValue }) => {
        const value = getValue<string>();
        const date = new Date(value);
        return (
          <time
            dateTime={value}
            title={formatDisplayDateTime(date)}
            className="whitespace-nowrap text-xs text-muted-foreground"
          >
            {formatRelativeTime(date)}
          </time>
        );
      },
    },
  ];
}
