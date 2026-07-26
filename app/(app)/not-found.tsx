import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Page not found</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            The page you are looking for does not exist or may have been
            moved.
          </p>
        </div>
        <Button render={<Link href="/dashboard" />} className="mt-2">
          Go to dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
