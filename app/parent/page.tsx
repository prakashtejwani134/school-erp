import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getParentContext } from "@/lib/parent-context";
import { AttentionStripSection } from "./_components/attention-strip-section";
import { AttentionStripSkeleton } from "./_components/attention-strip-skeleton";
import { FinancialHubSection } from "./_components/financial-hub-section";
import { FinancialHubSkeleton } from "./_components/financial-hub-skeleton";

export default async function ParentHomePage() {
  const context = await getParentContext();
  if (!context) redirect("/login");

  // TODO: student switcher — once a parent can be linked to more than one
  // child, surface a picker here and let it control which student is
  // "active" instead of always defaulting to the first.
  const activeStudent = context.students[0] ?? null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-medium">Parent Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeStudent
            ? `Showing ${activeStudent.firstName} ${activeStudent.lastName}`
            : "You're signed in, but no students are linked to your account yet."}
        </p>
      </div>

      {activeStudent ? (
        <>
          <Suspense fallback={<AttentionStripSkeleton />}>
            <AttentionStripSection schoolId={context.schoolId} student={activeStudent} />
          </Suspense>

          <Suspense fallback={<FinancialHubSkeleton />}>
            <FinancialHubSection
              schoolId={context.schoolId}
              studentId={activeStudent.id}
              studentName={`${activeStudent.firstName} ${activeStudent.lastName}`}
            />
          </Suspense>
        </>
      ) : null}
    </div>
  );
}
