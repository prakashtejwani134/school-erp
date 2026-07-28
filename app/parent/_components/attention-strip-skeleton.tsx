import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AttentionStripSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i} className="border-l-4 border-l-muted">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-32" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-7 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
