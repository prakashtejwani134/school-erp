import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-3.5 w-24" />
          </CardHeader>
          <div className="px-4 pb-4">
            <Skeleton className="h-[280px] w-full" />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="mt-2 h-3.5 w-28" />
          </CardHeader>
          <div className="px-4 pb-4">
            <Skeleton className="h-[280px] w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
