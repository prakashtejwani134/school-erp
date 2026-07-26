import { TableSkeleton } from "@/components/table-skeleton";

export default function ClassesLoading() {
  return (
    <div className="flex flex-col gap-4">
      <TableSkeleton columns={3} rows={6} />
    </div>
  );
}
