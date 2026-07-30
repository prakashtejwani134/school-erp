import type { Student } from "@prisma/client";

import { getAttentionStripData } from "../data";
import { AttentionStrip } from "./attention-strip";

// Split out from page.tsx so the heavier fee/attendance/circular/homework
// queries can run behind a <Suspense> boundary without blocking the rest of
// the page's first paint.
export async function AttentionStripSection({
  schoolId,
  student,
}: {
  schoolId: string;
  student: Student;
}) {
  const data = await getAttentionStripData(schoolId, {
    id: student.id,
    classId: student.classId,
  });

  return (
    <AttentionStrip
      studentName={`${student.firstName} ${student.lastName}`}
      feeDues={data.feeDues}
      totalFeeDue={data.totalFeeDue}
      attendanceRatePercent={data.attendanceRatePercent}
      consecutiveAbsences={data.consecutiveAbsences}
      unreadCircularCount={data.unreadCircularCount}
      hasRecentExamResult={data.hasRecentExamResult}
    />
  );
}
