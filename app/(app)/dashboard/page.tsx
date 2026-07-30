import { TrendingDown, TrendingUp } from "lucide-react";

import { requireRouteAccess } from "@/lib/route-access";
import { formatINR } from "@/lib/currency";
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
import {
  getAttendanceRadar,
  getFinancialRibbonSummary,
  getRecentActivity,
} from "./command-center-data";
import { FinancialRibbon } from "./_components/financial-ribbon";
import { AttendanceRadar } from "./_components/attendance-radar";
import { LiveActivityFeed } from "./_components/live-activity-feed";
import { SmartActionHubs } from "./_components/smart-action-hubs";
import { CommunicationHealthBadge } from "./_components/communication-health-badge";

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
  ] = await Promise.all([
    getFinancialRibbonSummary(schoolId),
    getAttendanceRadar(schoolId),
    getRecentActivity(schoolId),
    getMonthlyFinancials(schoolId),
    getFeeCategoryBreakdown(schoolId),
    getDashboardForecast(schoolId),
  ]);

  const isGrowthPositive =
    forecast.growthPercent !== null && forecast.growthPercent >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-medium">Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Everything that needs your attention today, in one place.
          </p>
        </div>
        <CommunicationHealthBadge />
      </div>

      <FinancialRibbon summary={financialSummary} />

      <FadeInStagger className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeInItem>
          <AttendanceRadar radar={attendanceRadar} />
        </FadeInItem>
        <FadeInItem>
          <LiveActivityFeed items={recentActivity} />
        </FadeInItem>
      </FadeInStagger>

      <SmartActionHubs role={role} />

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
