import { CalendarX2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttendancePageData } from "./data";

// Mirrors AttentionStrip's CONSECUTIVE_ABSENCE_THRESHOLD (attention-strip.tsx
// is out of scope to touch this phase, so this is kept in sync manually).
const CONSECUTIVE_ABSENCE_THRESHOLD = 2;

// Soft-tint tokens only: success (good) / danger (concerning) / accent
// (notable but not bad) / muted (neutral, e.g. an approved leave).
const STATUS_BADGE_STYLES: Record<string, string> = {
  PRESENT: "bg-success-tint text-success",
  ABSENT: "bg-danger-tint text-destructive",
  LATE: "bg-accent text-primary",
  LEAVE: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  LEAVE: "Leave",
};

export async function AttendanceSection({
  schoolId,
  studentId,
}: {
  schoolId: string;
  studentId: string;
}) {
  const { attendanceRatePercent, consecutiveAbsences, days } = await getAttendancePageData(
    schoolId,
    studentId,
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Attendance This Month</CardDescription>
          <CardTitle className="text-2xl tabular-nums">{attendanceRatePercent}%</CardTitle>
        </CardHeader>
        {consecutiveAbsences > CONSECUTIVE_ABSENCE_THRESHOLD ? (
          <CardContent>
            <Badge className={`border-transparent ${STATUS_BADGE_STYLES.ABSENT}`}>
              <CalendarX2 className="size-3.5" />
              {consecutiveAbsences} absences in a row
            </Badge>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Daily Record</CardTitle>
        </CardHeader>
        <CardContent>
          {days.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No attendance has been marked yet this month.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {days.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>{day.date}</span>
                  <Badge className={`border-transparent ${STATUS_BADGE_STYLES[day.status]}`}>
                    {STATUS_LABELS[day.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
