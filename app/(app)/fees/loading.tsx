import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";

export default function FeesLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
      </div>
      <TableSkeleton columns={7} rows={7} />
    </div>
  );
}
