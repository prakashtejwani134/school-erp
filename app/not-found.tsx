import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
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
          <Button nativeButton={false} render={<Link href="/login" />} className="mt-2">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
