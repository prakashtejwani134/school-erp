import { prisma } from "@/lib/prisma";
import { parseDateParam, todayParam } from "@/lib/date";
import { StatCard } from "@/components/stat-card";
import { FadeInItem, FadeInStagger } from "@/components/motion/fade-in";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const today = parseDateParam(todayParam());

  const [
    totalStudents,
    monthlyCollection,
    pendingDues,
    todayTotal,
    todayPresent,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.feeReceipt.aggregate({
      _sum: { paidAmount: true },
      where: { createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
    }),
    prisma.feeDue.aggregate({
      _sum: { dueAmount: true },
      _count: true,
      where: { isPaid: false },
    }),
    prisma.attendance.count({ where: { date: today } }),
    prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
  ]);

  const attendanceRate =
    todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

  return {
    totalStudents,
    monthlyCollected: monthlyCollection._sum.paidAmount ?? 0,
    pendingDuesAmount: pendingDues._sum.dueAmount ?? 0,
    pendingDuesCount: pendingDues._count,
    attendanceRate,
    todayTotal,
    todayPresent,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <FadeInStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FadeInItem>
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            format="integer"
            footer="Across all classes"
            icon="users"
          />
        </FadeInItem>
        <FadeInItem>
          <StatCard
            label="Monthly Fee Collected"
            value={stats.monthlyCollected}
            format="currency"
            footer="This calendar month"
            icon="indian-rupee"
          />
        </FadeInItem>
        <FadeInItem>
          <StatCard
            label="Pending Dues"
            value={stats.pendingDuesAmount}
            format="currency"
            footer={`${stats.pendingDuesCount} due${stats.pendingDuesCount === 1 ? "" : "s"} outstanding`}
            icon="receipt-text"
          />
        </FadeInItem>
        <FadeInItem>
          <StatCard
            label="Today's Attendance Rate"
            value={stats.attendanceRate}
            format="percent"
            footer={
              stats.todayTotal > 0
                ? `${stats.todayPresent} of ${stats.todayTotal} marked present`
                : "No attendance marked yet"
            }
            icon="calendar-check"
          />
        </FadeInItem>
      </FadeInStagger>
    </div>
  );
}
