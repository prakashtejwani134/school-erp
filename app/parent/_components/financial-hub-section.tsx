import { getFinancialHubData } from "./financial-hub-data";
import { FinancialHubCard } from "./financial-hub-card";

// Same Suspense-isolation pattern as attention-strip-section.tsx: the fee +
// receipt-history queries run behind their own boundary, independent of the
// rest of the page's first paint.
export async function FinancialHubSection({
  schoolId,
  studentId,
  studentName,
}: {
  schoolId: string;
  studentId: string;
  studentName: string;
}) {
  const data = await getFinancialHubData(schoolId, studentId);

  return <FinancialHubCard studentName={studentName} data={data} />;
}
