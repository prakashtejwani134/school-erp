"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, CalendarPlus, CircleDollarSign, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FinancialHubData } from "./financial-hub-data";
import { FinancialHubSheet } from "./financial-hub-sheet";

// Owns the Financial Hub sheet's open state for the "Pay Fees" chip — a
// second independent trigger onto the same reusable sheet FinancialHubCard
// already uses, not a duplicate feature.
export function QuickActionChips({
  studentName,
  financialHubData,
}: {
  studentName: string;
  financialHubData: FinancialHubData;
}) {
  const [payFeesOpen, setPayFeesOpen] = React.useState(false);

  return (
    <>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Button
          size="sm"
          variant="outline"
          className="h-11 shrink-0 snap-start rounded-full md:h-7"
          nativeButton={false}
          render={<Link href="/parent/leave" />}
        >
          <CalendarPlus className="size-3.5" />
          Apply Leave
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-11 shrink-0 snap-start rounded-full md:h-7"
          onClick={() => setPayFeesOpen(true)}
        >
          <CircleDollarSign className="size-3.5" />
          Pay Fees
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-11 shrink-0 snap-start rounded-full md:h-7"
          nativeButton={false}
          render={<Link href="/parent/homework" />}
        >
          <BookOpen className="size-3.5" />
          Homework
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-11 shrink-0 snap-start rounded-full md:h-7"
          nativeButton={false}
          render={<Link href="/parent/circulars" />}
        >
          <Megaphone className="size-3.5" />
          Circulars
        </Button>
      </div>

      <FinancialHubSheet
        open={payFeesOpen}
        onOpenChange={setPayFeesOpen}
        studentName={studentName}
        data={financialHubData}
      />
    </>
  );
}
