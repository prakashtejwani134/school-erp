import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function AttendanceLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid gap-1.5">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-8 w-full sm:w-48" />
        </div>
        <div className="grid gap-1.5">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-8 w-full sm:w-44" />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-0 px-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 border-t px-6 py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-full sm:w-56" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Skeleton className="h-8 w-36" />
        </CardFooter>
      </Card>
    </div>
  );
}
