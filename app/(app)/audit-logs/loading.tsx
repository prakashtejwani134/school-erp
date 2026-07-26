import { TableSkeleton, TableToolbarSkeleton } from "@/components/table-skeleton";

export default function AuditLogsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <TableToolbarSkeleton filters={2} showAction={false} />
      <TableSkeleton columns={5} rows={8} />
    </div>
  );
}
