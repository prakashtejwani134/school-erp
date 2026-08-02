import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import { getParentContext } from "@/lib/parent-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendanceSection } from "./attendance-section";
import { AttendanceSkeleton } from "./attendance-skeleton";

export default async function ParentAttendancePage() {
  const context = await getParentContext();
  if (!context) redirect("/login");

  // Same "default to first student" placeholder as the home page — TODO:
  // student switcher, see app/parent/page.tsx.
  const activeStudent = context.students[0] ?? null;

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
        <h1 className="mt-2 text-lg font-medium">Attendance</h1>
      </div>

      {activeStudent ? (
        <Suspense fallback={<AttendanceSkeleton />}>
          <AttendanceSection schoolId={context.schoolId} studentId={activeStudent.id} />
        </Suspense>
      ) : (
        <EmptyState
          title="No students linked yet"
          description="Contact the school office to link your child's profile to your account."
        />
      )}
    </div>
  );
}
