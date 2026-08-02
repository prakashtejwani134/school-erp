"use client";

import {
  type ColumnDef,
  type ExpandedState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedTableBody, AnimatedTableRow } from "@/components/motion/table-row";
import { ExpandableDetailRow } from "@/components/ui/expandable-table";

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  renderRowDetail,
  emptyMessage = "No results found.",
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData) => string;
  renderRowDetail?: (row: TData) => React.ReactNode;
  emptyMessage?: React.ReactNode;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, expanded },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    getRowCanExpand: () => Boolean(renderRowDetail),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <AnimatedTableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <AnimatedTableRow
                  className={renderRowDetail ? "cursor-pointer" : undefined}
                  onClick={
                    renderRowDetail ? () => row.toggleExpanded() : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </AnimatedTableRow>
                {renderRowDetail ? (
                  <ExpandableDetailRow
                    open={row.getIsExpanded()}
                    colSpan={columns.length}
                  >
                    {renderRowDetail(row.original)}
                  </ExpandableDetailRow>
                ) : null}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="whitespace-normal text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </AnimatedTableBody>
      </Table>
    </div>
  );
}
