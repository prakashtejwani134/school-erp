"use client";

import * as React from "react";
import { CircleDollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import type { FinancialHubData } from "./financial-hub-data";
import { FinancialHubSheet } from "./financial-hub-sheet";

// Owns the open/close state for FinancialHubSheet — page.tsx is a Server
// Component and can't hold that state itself, so this is the entry point
// wired in from there (a simple card + trigger button, per the brief).
export function FinancialHubCard({
  studentName,
  data,
}: {
  studentName: string;
  data: FinancialHubData;
}) {
  const [open, setOpen] = React.useState(false);

  // Real payment history, oldest to newest, for a "money coming in" trend —
  // not forced onto cards that don't have a natural time series.
  const paymentTrend = [...data.receipts].reverse().map((r) => r.paidAmount);

  return (
    <>
      <Card className="max-w-sm">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <CircleDollarSign className="size-4 text-muted-foreground" />
            Financial Hub
          </CardDescription>
          <CardTitle className="text-base font-medium">
            Fees, challans &amp; payment history
          </CardTitle>
        </CardHeader>
        {paymentTrend.length >= 2 ? (
          <div className="px-(--card-spacing)">
            <Sparkline data={paymentTrend} />
          </div>
        ) : null}
        <CardFooter>
          <Button
            size="sm"
            variant="outline"
            className="h-11 md:h-7"
            onClick={() => setOpen(true)}
          >
            View Fee Details
          </Button>
        </CardFooter>
      </Card>

      <FinancialHubSheet
        open={open}
        onOpenChange={setOpen}
        studentName={studentName}
        data={data}
      />
    </>
  );
}
