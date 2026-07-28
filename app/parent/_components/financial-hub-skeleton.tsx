import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FinancialHubSkeleton() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-5 w-48" />
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-7 w-32" />
      </CardFooter>
    </Card>
  );
}
