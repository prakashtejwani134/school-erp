import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Toolbar-shaped skeleton (search box + filter selects + primary action) matching the row above most data tables. */
export function TableToolbarSkeleton({
  filters = 1,
  showAction = true,
}: {
  filters?: number;
  showAction?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton className="h-8 min-w-[220px] flex-1" />
      {Array.from({ length: filters }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-[160px]" />
      ))}
      {showAction ? (
        <Skeleton className="ml-auto h-8 w-32 sm:ml-0" />
      ) : null}
    </div>
  );
}

/** Fixed-shape table skeleton — mirrors `DataTable`'s bordered container so real content swaps in without shifting layout. */
export function TableSkeleton({
  columns = 4,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r} className="hover:bg-transparent">
              {Array.from({ length: columns }).map((_, c) => (
                <TableCell key={c}>
                  <Skeleton className="h-4 w-full max-w-32" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
