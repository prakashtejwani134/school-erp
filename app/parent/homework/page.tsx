import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

import { getParentContext } from "@/lib/parent-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Placeholder route — the Homework model exists, but no parent-facing list
// view has been built yet. Wired here so the "Homework" quick action and
// category-grid link have somewhere real to go instead of a 404; building
// the actual list view is out of scope for now.
export default async function ParentHomeworkPage() {
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
        <h1 className="mt-2 text-lg font-medium">Homework</h1>
      </div>

      <Card className="max-w-sm">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-muted-foreground" />
            Assignments
          </CardDescription>
          <CardTitle className="text-base font-medium">Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A list of your child&apos;s homework isn&apos;t available yet. Check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
