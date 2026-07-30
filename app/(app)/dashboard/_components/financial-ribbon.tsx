import { IndianRupee, Receipt, TriangleAlert } from "lucide-react";

import { StatCard } from "@/components/stat-card";
import { FadeInItem, FadeInStagger } from "@/components/motion/fade-in";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/currency";
import { PAYMENT_MODE_BADGE_STYLES, PAYMENT_MODE_LABELS } from "@/lib/payment-mode";
import type { FinancialRibbonSummary } from "../command-center-data";
import { SendReminderButton } from "./send-reminder-button";

export function FinancialRibbon({ summary }: { summary: FinancialRibbonSummary }) {
  return (
    <div className="flex flex-col gap-4">
      <FadeInStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FadeInItem>
          <StatCard
            label="Total Students"
            value={summary.totalStudents}
            format="integer"
            footer="Across all classes"
            icon="users"
          />
        </FadeInItem>
        <FadeInItem>
          <StatCard
            label="Today's Collection"
            value={summary.todayCollected}
            format="currency"
            footer={`${summary.todayReceiptCount} receipt${summary.todayReceiptCount === 1 ? "" : "s"} so far today`}
            icon="indian-rupee"
          />
        </FadeInItem>
        <FadeInItem>
          <StatCard
            label="Pending Dues"
            value={summary.pendingDuesAmount}
            format="currency"
            footer={`${summary.pendingDuesCount} due${summary.pendingDuesCount === 1 ? "" : "s"} outstanding`}
            icon="receipt-text"
          />
        </FadeInItem>
        <FadeInItem>
          <StatCard
            label="High-Risk Defaulters"
            value={summary.highRiskDefaulterCount}
            format="integer"
            footer="Students with the steepest overdue risk score"
            icon="users"
          />
        </FadeInItem>
      </FadeInStagger>

      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <IndianRupee className="size-4 text-muted-foreground" />
            Payment Mode Breakdown
          </CardTitle>
          <CardAction>
            <SendReminderButton highRiskDefaulterCount={summary.highRiskDefaulterCount} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {summary.byMode.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {summary.byMode.map((share) => (
                <Badge
                  key={share.mode}
                  className={`border-transparent ${PAYMENT_MODE_BADGE_STYLES[share.mode]}`}
                >
                  {PAYMENT_MODE_LABELS[share.mode]} · {formatINR(share.amount)} ({share.count})
                </Badge>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Receipt className="size-3.5" />
              No fee collections recorded yet today.
            </p>
          )}
          {summary.highRiskDefaulterCount > 0 ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TriangleAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
              {summary.highRiskDefaulterCount} famil
              {summary.highRiskDefaulterCount === 1 ? "y is" : "ies are"} flagged HIGH risk on overdue fees.
            </p>
          ) : null}
        </CardContent>
      </GlassCard>
    </div>
  );
}
