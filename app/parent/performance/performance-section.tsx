import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Grade } from "@/lib/grades";
import { getPerformancePageData } from "./data";

const GRADE_BADGE_STYLES: Record<Grade, string> = {
  "A+": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  A: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  B: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  C: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  D: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  F: "bg-red-500/15 text-red-700 dark:text-red-400",
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
        isUp
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-red-500/15 text-red-700 dark:text-red-400"
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
