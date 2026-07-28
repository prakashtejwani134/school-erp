import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getParentContext } from "@/lib/parent-context";
import { AttentionStripSection } from "./_components/attention-strip-section";
import { AttentionStripSkeleton } from "./_components/attention-strip-skeleton";
import { FinancialHubSection } from "./_components/financial-hub-section";
import { FinancialHubSkeleton } from "./_components/financial-hub-skeleton";
import { getFinancialHubData } from "./_components/financial-hub-data";
import { QuickActionChips } from "./_components/quick-action-chips";
import { SmartCategoryGrid } from "./_components/smart-category-grid";

export default async function ParentHomePage() {
  const context = await getParentContext();
  if (!context) redirect("/login");

  // TODO: student switcher — once a parent can be linked to more than one
  // child, surface a picker here and let it control which student is
  // "active" instead of always defaulting to the first.
  const activeStudent = context.students[0] ?? null;

  // Fetched directly (not Suspense-deferred) since the quick-action chip
  // row is meant to be always visible right under the AttentionStrip, not
  // gated behind its own loading skeleton. FinancialHubSection below still
  // fetches this independently for its own Suspense boundary — same
  // duplicate-fetch-per-boundary pattern already used for fee data between
  // the AttentionStrip and Financial Hub.
  const financialHubData = activeStudent
    ? await getFinancialHubData(context.schoolId, activeStudent.id)
    : null;

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

      {activeStudent && financialHubData ? (
        <>
          <Suspense fallback={<AttentionStripSkeleton />}>
            <AttentionStripSection schoolId={context.schoolId} student={activeStudent} />
          </Suspense>

          <QuickActionChips
            studentName={`${activeStudent.firstName} ${activeStudent.lastName}`}
            financialHubData={financialHubData}
          />

          <Suspense fallback={<FinancialHubSkeleton />}>
            <FinancialHubSection
              schoolId={context.schoolId}
              studentId={activeStudent.id}
              studentName={`${activeStudent.firstName} ${activeStudent.lastName}`}
            />
          </Suspense>

          <SmartCategoryGrid />
        </>
      ) : null}
    </div>
  );
}
