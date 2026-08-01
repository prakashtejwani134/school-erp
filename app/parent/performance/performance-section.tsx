import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import type { Grade } from "@/lib/grades";
import { getPerformancePageData } from "./data";

// Soft-tint tokens only, bucketed into 4 bands rather than 6 distinct hues
// (A+/A share a band, as the original did) — success for strong grades,
// accent for a solid-but-not-top grade, muted for a middling one, danger
// for grades that need attention.
const GRADE_BADGE_STYLES: Record<Grade, string> = {
  "A+": "bg-success-tint text-success",
  A: "bg-success-tint text-success",
  B: "bg-accent text-primary",
  C: "bg-muted text-muted-foreground",
  D: "bg-danger-tint text-destructive",
  F: "bg-danger-tint text-destructive",
};

function TrendBadge({
  trend,
}: {
  trend: { direction: "up" | "down" | "same"; deltaPercentage: number };
}) {
  if (trend.direction === "same") {
    return (
      <Badge className="border-transparent bg-muted text-muted-foreground">
        <Minus className="size-3.5" />
        Same as last exam
      </Badge>
    );
  }
  const isUp = trend.direction === "up";
  return (
    <Badge
      className={`border-transparent ${
        isUp ? "bg-success-tint text-success" : "bg-danger-tint text-destructive"
      }`}
    >
      {isUp ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}
      {trend.deltaPercentage}% {isUp ? "up" : "down"} from last exam
    </Badge>
  );
}

export async function PerformanceSection({
  schoolId,
  studentId,
}: {
  schoolId: string;
  studentId: string;
}) {
  const { exams, trend } = await getPerformancePageData(schoolId, studentId);

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No exam results published yet.
        </CardContent>
      </Card>
    );
  }

  // Real percentage-over-time series, oldest to newest (exams is sorted
  // most-recent-first) — a natural sparkline, not a forced one.
  const percentageTrend = [...exams].reverse().map((e) => e.overallPercentage);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Latest Exam — {exams[0].examName}</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {exams[0].overallPercentage}%{" "}
            <span className="text-lg text-muted-foreground">
              ({exams[0].overallGrade})
            </span>
          </CardTitle>
        </CardHeader>
        {percentageTrend.length >= 2 ? (
          <div className="px-(--card-spacing)">
            <Sparkline data={percentageTrend} />
          </div>
        ) : null}
        {trend ? (
          <CardContent>
            <TrendBadge trend={trend} />
          </CardContent>
        ) : null}
      </Card>

      {exams.map((exam) => (
        <Card key={exam.examId}>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {exam.examName}
            </CardTitle>
            <CardDescription>
              {exam.examDate} · Overall {exam.overallPercentage}% (
              {exam.overallGrade})
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {exam.subjects.map((subject) => (
              <div
                key={subject.subjectName}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span>{subject.subjectName}</span>
                <span className="flex items-center gap-3">
                  <span className="text-muted-foreground tabular-nums">
                    {subject.marksObtained}/{subject.maxMarks}
                  </span>
                  <Badge
                    className={`border-transparent ${GRADE_BADGE_STYLES[subject.grade]}`}
                  >
                    {subject.grade}
                  </Badge>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
