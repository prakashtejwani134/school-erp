import "server-only";

import { prisma } from "@/lib/prisma";
import { formatDisplayDate } from "@/lib/date";
import { computeGrade, computePercentage, type Grade } from "@/lib/grades";

export type SubjectMarkRow = {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: Grade;
};

export type ExamResultRow = {
  examId: string;
  examName: string;
  examDate: string;
  subjects: SubjectMarkRow[];
  overallPercentage: number;
  overallGrade: Grade;
};

export type PerformanceTrend = {
  direction: "up" | "down" | "same";
  deltaPercentage: number;
};

export type PerformancePageData = {
  exams: ExamResultRow[];
  trend: PerformanceTrend | null;
};

function computeOverall(subjects: SubjectMarkRow[]): {
  percentage: number;
  grade: Grade;
} {
  const totalObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalMax = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const percentage = computePercentage(totalObtained, totalMax);
  return { percentage, grade: computeGrade(percentage) };
}

/** Groups this student's marks by exam (most recent exam first — relies on the query's `orderBy`, since a Map preserves first-insertion order per key) and computes a simple two-exam trend if more than one exam has results. */
export async function getPerformancePageData(
  schoolId: string,
  studentId: string,
): Promise<PerformancePageData> {
  const marks = await prisma.mark.findMany({
    where: { studentId, exam: { schoolId } },
    include: { exam: true, subject: true },
    orderBy: { exam: { examDate: "desc" } },
  });

  const examMap = new Map<
    string,
    { examName: string; examDate: Date; subjects: SubjectMarkRow[] }
  >();

  for (const mark of marks) {
    const entry = examMap.get(mark.examId) ?? {
      examName: mark.exam.name,
      examDate: mark.exam.examDate,
      subjects: [],
    };
    const percentage = computePercentage(mark.marksObtained, mark.maxMarks);
    entry.subjects.push({
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      maxMarks: mark.maxMarks,
      percentage,
      grade: computeGrade(percentage),
    });
    examMap.set(mark.examId, entry);
  }

  const exams: ExamResultRow[] = [...examMap.entries()].map(
    ([examId, entry]) => {
      const overall = computeOverall(entry.subjects);
      return {
        examId,
        examName: entry.examName,
        examDate: formatDisplayDate(entry.examDate),
        subjects: entry.subjects,
        overallPercentage: overall.percentage,
        overallGrade: overall.grade,
      };
    },
  );

  let trend: PerformanceTrend | null = null;
  if (exams.length >= 2) {
    const delta = exams[0].overallPercentage - exams[1].overallPercentage;
    trend = {
      direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
      deltaPercentage: Math.round(Math.abs(delta) * 100) / 100,
    };
  }

  return { exams, trend };
}
