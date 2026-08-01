"use client";

import * as React from "react";
import { CalendarX2, TriangleAlert } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttendanceRadar as AttendanceRadarData } from "../command-center-data";
import { UnmarkedAttendanceSheet } from "./unmarked-attendance-sheet";

export function AttendanceRadar({ radar }: { radar: AttendanceRadarData }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-1.5">
                <CalendarX2 className="size-4 text-muted-foreground" />
                Attendance &amp; Defaulters Radar
              </CardTitle>
              <CardDescription>Class-wise marking status for today</CardDescription>
            </div>
            <CardAction>
              {radar.totalUnmarked > 0 ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="flex h-11 items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-500/25 md:h-6 dark:text-red-400"
                >
                  <TriangleAlert className="size-3.5" />
                  {radar.totalUnmarked} student{radar.totalUnmarked === 1 ? "" : "s"} unmarked
                  today
                </button>
              ) : (
                <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  All marked
                </Badge>
              )}
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          {radar.classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a class to see attendance here.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {radar.classes.map((cls) => (
                <div
                  key={cls.classId}
                  className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
                >
                  <span className="min-w-0 truncate">
                    {cls.name} - {cls.section}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {cls.unmarkedCount > 0 ? (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {cls.unmarkedCount} unmarked
                      </span>
                    ) : null}
                    <span className="font-medium tabular-nums">
                      {cls.attendanceRate === null ? "Not marked yet" : `${cls.attendanceRate}%`}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UnmarkedAttendanceSheet open={open} onOpenChange={setOpen} classes={radar.classes} />
    </>
  );
}
