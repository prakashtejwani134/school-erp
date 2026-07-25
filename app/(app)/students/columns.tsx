"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { StudentRow } from "./types";

function SortButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={onClick}>
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  );
}

export function FeeStatusBadge({
  status,
  pendingDueCount,
}: {
  status: StudentRow["feeStatus"];
  pendingDueCount: number;
}) {
  if (status === "PAID") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        Paid
      </Badge>
    );
  }
  if (status === "PENDING") {
    return (
      <Badge className="border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400">
        Pending ({pendingDueCount})
      </Badge>
    );
  }
  return <Badge variant="secondary">No dues</Badge>;
}

export function getColumns({
  onEdit,
  onDeleteRequest,
}: {
  onEdit: (student: StudentRow) => void;
  onDeleteRequest: (student: StudentRow) => void;
}): ColumnDef<StudentRow>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <ChevronRight
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            row.getIsExpanded() && "rotate-90",
          )}
        />
      ),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <SortButton
          label="Student Name"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "admissionNo",
      header: "Admission No",
    },
    {
      id: "className",
      accessorFn: (row) => row.className,
      header: ({ column }) => (
        <SortButton
          label="Class"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
    },
    {
      accessorKey: "parentPhone",
      header: "Parent Phone",
    },
    {
      id: "feeStatus",
      header: "Fee Status",
      cell: ({ row }) => (
        <FeeStatusBadge
          status={row.original.feeStatus}
          pendingDueCount={row.original.pendingDueCount}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div
          className="flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="ml-auto flex">
                  <MoreHorizontal />
                  <span className="sr-only">Open actions</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDeleteRequest(row.original)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
