import { TableSkeleton, TableToolbarSkeleton } from "@/components/table-skeleton";

export default function StudentsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <TableToolbarSkeleton filters={1} />
      <TableSkeleton columns={6} rows={7} />
    </div>
  );
}
