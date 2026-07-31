import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";

import { getParentContext } from "@/lib/parent-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Placeholder route — no Leave model/workflow exists yet. Wired here so the
// "Apply Leave" quick action and category-grid link have somewhere real to
// go instead of a 404; building the actual feature is out of scope for now.
export default async function ParentLeavePage() {
  const context = await getParentContext();
  if (!context) redirect("/login");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Button
          size="sm"
          variant="ghost"
          className="h-11 md:h-7"
          nativeButton={false}
          render={<Link href="/parent" />}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <h1 className="mt-2 text-lg font-medium">Apply Leave</h1>
      </div>

      <Card className="max-w-sm">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <CalendarPlus className="size-4 text-muted-foreground" />
            Leave requests
          </CardDescription>
          <CardTitle className="text-base font-medium">Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Applying for leave on your child&apos;s behalf isn&apos;t available yet. Check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
