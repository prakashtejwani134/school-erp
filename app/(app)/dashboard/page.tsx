import { TrendingDown, TrendingUp } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { parseDateParam, todayParam } from "@/lib/date";
import { requireRouteAccess } from "@/lib/route-access";
import { formatINR } from "@/lib/currency";
import { StatCard } from "@/components/stat-card";
import { FadeInItem, FadeInStagger } from "@/components/motion/fade-in";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CollectionsBarChart, FeeCategoryDonut } from "@/components/charts/lazy";
import {
  getDashboardForecast,
  getFeeCategoryBreakdown,
  getMonthlyFinancials,
} from "./analytics";

export const dynamic = "force-dynamic";

async function getDashboardStats(schoolId: string) {
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
    prisma.student.count({ where: { schoolId } }),
    prisma.feeReceipt.aggregate({
      _sum: { paidAmount: true },
      where: { schoolId, createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
    }),
    prisma.feeDue.aggregate({
      _sum: { dueAmount: true },
      _count: true,
      where: { schoolId, isPaid: false },
    }),
    prisma.attendance.count({ where: { schoolId, date: today } }),
    prisma.attendance.count({
      where: { schoolId, date: today, status: "PRESENT" },
    }),
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
  const { schoolId } = await requireRouteAccess("dashboard");

  const [stats, monthlyFinancials, feeCategoryBreakdown, forecast] =
    await Promise.all([
      getDashboardStats(schoolId),
      getMonthlyFinancials(schoolId),
      getFeeCategoryBreakdown(schoolId),
      getDashboardForecast(schoolId),
    ]);

  const isGrowthPositive =
    forecast.growthPercent !== null && forecast.growthPercent >= 0;

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

      <FadeInStagger className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <FadeInItem className="lg:col-span-3">
          <GlassCard className="h-full">
            <CardHeader>
              <CardTitle>Collections vs Pending Dues</CardTitle>
              <CardDescription>
                Last 6 months · forecasting {formatINR(forecast.forecastedCollection)}{" "}
                this month
              </CardDescription>
              {forecast.growthPercent !== null ? (
                <CardAction>
                  <Badge
                    className={`border-transparent ${
                      isGrowthPositive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {isGrowthPositive ? <TrendingUp /> : <TrendingDown />}
                    {isGrowthPositive ? "+" : ""}
                    {Math.round(forecast.growthPercent)}% vs last month
                  </Badge>
                </CardAction>
              ) : null}
            </CardHeader>
            <div className="px-2 pb-2">
              <CollectionsBarChart data={monthlyFinancials} />
            </div>
          </GlassCard>
        </FadeInItem>

        <FadeInItem className="lg:col-span-2">
          <GlassCard className="h-full">
            <CardHeader>
              <CardTitle>Fee Breakdown by Category</CardTitle>
              <CardDescription>All-time collections</CardDescription>
            </CardHeader>
            <div className="px-2 pb-2">
              <FeeCategoryDonut data={feeCategoryBreakdown} />
            </div>
          </GlassCard>
        </FadeInItem>
      </FadeInStagger>
    </div>
  );
}
