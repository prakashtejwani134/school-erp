import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import { getParentContext } from "@/lib/parent-context";
import { Button } from "@/components/ui/button";
import { CircularsSection } from "./circulars-section";
import { CircularsSkeleton } from "./circulars-skeleton";

export default async function ParentCircularsPage() {
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
        <h1 className="mt-2 text-lg font-medium">Circulars</h1>
      </div>

      <Suspense fallback={<CircularsSkeleton />}>
        <CircularsSection schoolId={context.schoolId} />
      </Suspense>
    </div>
  );
}
