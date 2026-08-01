import { TrendingDown, TrendingUp } from "lucide-react";

import { requireRouteAccess } from "@/lib/route-access";
import { formatINR } from "@/lib/currency";
import { FadeInItem, FadeInStagger } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import {
  Card,
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
import {
  getAttendanceRadar,
  getAttendanceTrend,
  getFinancialRibbonSummary,
  getRecentActivity,
} from "./command-center-data";
import { FinancialRibbon } from "./_components/financial-ribbon";
import { AttendanceRadar } from "./_components/attendance-radar";
import { LiveActivityFeed } from "./_components/live-activity-feed";
import { ProgressStatCard } from "./_components/progress-stat-card";
import { SmartActionHubs } from "./_components/smart-action-hubs";
import { CommunicationHealthBadge } from "./_components/communication-health-badge";
import { SendDigestButton } from "./_components/send-digest-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { schoolId, role } = await requireRouteAccess("dashboard");

  const [
    financialSummary,
    attendanceRadar,
    recentActivity,
    monthlyFinancials,
    feeCategoryBreakdown,
    forecast,
    attendanceTrend,
  ] = await Promise.all([
    getFinancialRibbonSummary(schoolId),
    getAttendanceRadar(schoolId),
    getRecentActivity(schoolId),
    getMonthlyFinancials(schoolId),
    getFeeCategoryBreakdown(schoolId),
    getDashboardForecast(schoolId),
    getAttendanceTrend(schoolId),
  ]);

  const isGrowthPositive =
    forecast.growthPercent !== null && forecast.growthPercent >= 0;

  // Aggregate today's attendance rate across all classes (weighted by how
  // many students are actually marked, not a plain average-of-percentages).
  const totalsToday = attendanceRadar.classes.reduce(
    (acc, cls) => ({
      marked: acc.marked + cls.markedCount,
      present: acc.present + cls.presentCount,
    }),
    { marked: 0, present: 0 },
  );
  const attendanceRateToday =
    totalsToday.marked > 0 ? (totalsToday.present / totalsToday.marked) * 100 : null;

  const currentMonth = monthlyFinancials[monthlyFinancials.length - 1];
  const feeCollectionDenominator = currentMonth
    ? currentMonth.collected + currentMonth.pending
    : 0;
  const feeCollectionPercent =
    feeCollectionDenominator > 0
      ? (currentMonth.collected / feeCollectionDenominator) * 100
      : null;
  const collectionTrend = monthlyFinancials.map((m) => m.collected);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-medium">Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Everything that needs your attention today, in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CommunicationHealthBadge />
          <SendDigestButton />
        </div>
      </div>

      {/* Bento grid: Financial Ribbon is the heaviest tile (spans 4 of 6
          columns, 2 rows), the two progress rings fill the gap beside it,
          and Attendance Radar / Live Activity Feed sit below as medium
          tiles — per "The Registrar" Command Center layout. */}
      <FadeInStagger className="grid grid-cols-1 gap-4 lg:grid-cols-6 lg:auto-rows-fr">
        <FadeInItem className="lg:col-span-4 lg:row-span-2">
          <FinancialRibbon summary={financialSummary} collectionTrend={collectionTrend} />
        </FadeInItem>
        <FadeInItem className="lg:col-span-2">
          <ProgressStatCard
            title="Attendance Today"
            description="School-wide, weighted by marked students"
            value={attendanceRateToday}
            ringLabel="Present"
            trend={attendanceTrend}
          />
        </FadeInItem>
        <FadeInItem className="lg:col-span-2">
          <ProgressStatCard
            title="Fee Collection"
            description="This month, collected vs. due"
            value={feeCollectionPercent}
            ringLabel="Collected"
            trend={collectionTrend}
          />
        </FadeInItem>
        <FadeInItem className="lg:col-span-3">
          <AttendanceRadar radar={attendanceRadar} />
        </FadeInItem>
        <FadeInItem className="lg:col-span-3">
          <LiveActivityFeed items={recentActivity} />
        </FadeInItem>
      </FadeInStagger>

      <SmartActionHubs role={role} />

      <FadeInStagger className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <FadeInItem className="lg:col-span-3">
          <Card className="h-full">
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
          </Card>
        </FadeInItem>

        <FadeInItem className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Fee Breakdown by Category</CardTitle>
              <CardDescription>All-time collections</CardDescription>
            </CardHeader>
            <div className="px-2 pb-2">
              <FeeCategoryDonut data={feeCategoryBreakdown} />
            </div>
          </Card>
        </FadeInItem>
      </FadeInStagger>
    </div>
  );
}
