"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred. You can try again, or return to
              sign in.
            </p>
            {error.digest ? (
              <p className="pt-1 font-mono text-xs text-muted-foreground">
                Reference: {error.digest}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => unstable_retry()}>
              Try again
            </Button>
            <Button render={<Link href="/login" />}>Back to sign in</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
