"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, CalendarX2, Megaphone, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeInItem, FadeInStagger } from "@/components/motion/fade-in";
import { formatINR } from "@/lib/currency";
import type { FeeDueRow } from "../data";
import { PayFeeSheet } from "./pay-fee-sheet";

const ATTENDANCE_RATE_THRESHOLD = 85;
const CONSECUTIVE_ABSENCE_THRESHOLD = 2;
const MAX_CARDS = 3;

type AttentionCard = {
  key: string;
  accentClassName: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  cta: React.ReactNode;
};

export function AttentionStrip({
  studentName,
  feeDues,
  totalFeeDue,
  attendanceRatePercent,
  consecutiveAbsences,
  unreadCircularCount,
  hasRecentExamResult,
}: {
  studentName: string;
  feeDues: FeeDueRow[];
  totalFeeDue: number;
  attendanceRatePercent: number;
  consecutiveAbsences: number;
  unreadCircularCount: number;
  hasRecentExamResult: boolean;
}) {
  const [paySheetOpen, setPaySheetOpen] = React.useState(false);

  const attendanceIsLow =
    attendanceRatePercent < ATTENDANCE_RATE_THRESHOLD ||
    consecutiveAbsences > CONSECUTIVE_ABSENCE_THRESHOLD;

  const cards: AttentionCard[] = [];

  if (totalFeeDue > 0) {
    cards.push({
      key: "fee",
      accentClassName: "border-l-red-500 dark:border-l-red-400",
      icon: <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />,
      label: "Pending Fee",
      value: formatINR(totalFeeDue),
      detail: `${feeDues.length} due${feeDues.length === 1 ? "" : "s"} outstanding`,
      cta: (
        <Button
          size="sm"
          className="h-11 md:h-7"
          onClick={() => setPaySheetOpen(true)}
        >
          Pay Now
        </Button>
      ),
    });
  }

  if (attendanceIsLow) {
    cards.push({
      key: "attendance",
      accentClassName: "border-l-amber-500 dark:border-l-amber-400",
      icon: <CalendarX2 className="size-4 text-amber-600 dark:text-amber-400" />,
      label: "Attendance This Month",
      value: `${attendanceRatePercent}%`,
      detail:
        consecutiveAbsences > CONSECUTIVE_ABSENCE_THRESHOLD
          ? `${consecutiveAbsences} absences in a row`
          : "Below the 85% mark this month",
      cta: (
        <Button
          size="sm"
          variant="outline"
          className="h-11 md:h-7"
          nativeButton={false}
          render={<Link href="/parent/attendance" />}
        >
          View Attendance
        </Button>
      ),
    });
  }

  if (unreadCircularCount > 0) {
    cards.push({
      key: "circulars",
      accentClassName: "border-l-indigo-500 dark:border-l-indigo-400",
      icon: <Megaphone className="size-4 text-indigo-600 dark:text-indigo-400" />,
      label: "New Circulars",
      value: String(unreadCircularCount),
      detail: `${unreadCircularCount} new notice${unreadCircularCount === 1 ? "" : "s"} from the school`,
      cta: (
        <Button
          size="sm"
          variant="outline"
          className="h-11 md:h-7"
          nativeButton={false}
          render={<Link href="/parent/circulars" />}
        >
          Read Now
        </Button>
      ),
    });
  }

  if (hasRecentExamResult) {
    cards.push({
      key: "performance",
      accentClassName: "border-l-emerald-500 dark:border-l-emerald-400",
      icon: <Trophy className="size-4 text-emerald-600 dark:text-emerald-400" />,
      label: "New Result Published",
      value: "New",
      detail: "A new exam result is ready to view",
      cta: (
        <Button
          size="sm"
          variant="outline"
          className="h-11 md:h-7"
          nativeButton={false}
          render={<Link href="/parent/performance" />}
        >
          View Result
        </Button>
      ),
    });
  }

  const visibleCards = cards.slice(0, MAX_CARDS);

  if (visibleCards.length === 0) return null;

  return (
    <>
      <FadeInStagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {visibleCards.map((card) => (
          <FadeInItem key={card.key}>
            <Card className={`h-full border-l-4 ${card.accentClassName}`}>
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  {card.icon}
                  {card.label}
                </CardDescription>
                <CardTitle className="text-xl tabular-nums">{card.value}</CardTitle>
              </CardHeader>
              <CardFooter className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{card.detail}</p>
                {card.cta}
              </CardFooter>
            </Card>
          </FadeInItem>
        ))}
      </FadeInStagger>

      <PayFeeSheet
        open={paySheetOpen}
        onOpenChange={setPaySheetOpen}
        studentName={studentName}
        feeDues={feeDues}
        totalFeeDue={totalFeeDue}
      />
    </>
  );
}
