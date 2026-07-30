"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseDateParam, formatDisplayDate } from "@/lib/date";
import { logAudit } from "@/lib/audit";
import { requireActiveSchoolContext } from "@/lib/school-context";
import type { MarkEntryRow } from "./types";

const DEFAULT_MAX_MARKS = 100;

function parseExamForm(formData: FormData): {
  name: string;
  examDate: string;
  classId: string;
} {
  const name = String(formData.get("name") ?? "").trim();
  const examDate = String(formData.get("examDate") ?? "").trim();
  const classId = String(formData.get("classId") ?? "").trim();

  if (!name) throw new Error("Exam name is required.");
  if (!examDate) throw new Error("Exam date is required.");
  if (!classId) throw new Error("Class is required.");

  return { name, examDate, classId };
}

export async function createExam(formData: FormData) {
  const { schoolId } = await requireActiveSchoolContext();
  const data = parseExamForm(formData);

  const classBelongsToSchool = await prisma.class.count({
    where: { id: data.classId, schoolId },
  });
  if (!classBelongsToSchool) throw new Error("Invalid class.");

  const created = await prisma.exam.create({
    data: {
      schoolId,
      name: data.name,
      examDate: parseDateParam(data.examDate),
      classId: data.classId,
    },
  });

  await logAudit({
    actionType: "EXAM_CREATED",
    targetEntity: "Exam",
    targetId: created.id,
    details: `${data.name} (${formatDisplayDate(created.examDate)})`,
  });

  revalidatePath("/exams");
}

/** Students in the exam's class, each merged with their existing mark (if any) for this exam+subject — used to prefill the marks-entry table. */
export async function getMarksForExamSubject(
  examId: string,
  subjectId: string,
): Promise<MarkEntryRow[]> {
  if (!examId || !subjectId) return [];
  const { schoolId } = await requireActiveSchoolContext();

  const exam = await prisma.exam.findFirst({ where: { id: examId, schoolId } });
  if (!exam) throw new Error("This exam no longer exists.");

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, schoolId },
  });
  if (!subject) throw new Error("This subject no longer exists.");

  const students = await prisma.student.findMany({
    where: { schoolId, classId: exam.classId },
    orderBy: [{ firstName: "asc" }],
    include: {
      marks: { where: { examId, subjectId } },
    },
  });

  return students.map((student) => {
    const existing = student.marks[0];
    return {
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNo: student.admissionNo,
      marksObtained: existing?.marksObtained ?? null,
      maxMarks: existing?.maxMarks ?? DEFAULT_MAX_MARKS,
    };
  });
}

export type SaveMarksRecord = {
  studentId: string;
  marksObtained: number;
};

export async function saveMarks(
  examId: string,
  subjectId: string,
  maxMarks: number,
  records: SaveMarksRecord[],
) {
  if (!examId) throw new Error("Select an exam.");
  if (!subjectId) throw new Error("Select a subject.");
  if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
    throw new Error("Max marks must be a positive number.");
  }
  if (records.length === 0) return;

  const { schoolId } = await requireActiveSchoolContext();

  const exam = await prisma.exam.findFirst({ where: { id: examId, schoolId } });
  if (!exam) throw new Error("This exam no longer exists.");

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, schoolId },
  });
  if (!subject) throw new Error("This subject no longer exists.");

  for (const record of records) {
    if (
      !Number.isFinite(record.marksObtained) ||
      record.marksObtained < 0 ||
      record.marksObtained > maxMarks
    ) {
      throw new Error(
        `Marks must be between 0 and ${maxMarks} for every student.`,
      );
    }
  }

  // Defends against a tampered batch payload referencing students outside
  // the exam's class.
  const validStudentCount = await prisma.student.count({
    where: {
      id: { in: records.map((r) => r.studentId) },
      schoolId,
      classId: exam.classId,
    },
  });
  if (validStudentCount !== records.length) {
    throw new Error("One or more students don't belong to this exam's class.");
  }

  try {
    await prisma.$transaction(
      records.map((record) =>
        prisma.mark.upsert({
          where: {
            examId_studentId_subjectId: {
              examId,
              studentId: record.studentId,
              subjectId,
            },
          },
          update: { marksObtained: record.marksObtained, maxMarks },
          create: {
            examId,
            studentId: record.studentId,
            subjectId,
            marksObtained: record.marksObtained,
            maxMarks,
          },
        }),
      ),
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Failed to save marks. Please try again.");
    }
    throw error;
  }

  await logAudit({
    actionType: "MARKS_ENTERED",
    targetEntity: "Mark",
    details: `${subject.name} — ${records.length} student${records.length === 1 ? "" : "s"} for ${exam.name}`,
  });

  revalidatePath("/exams");
  revalidatePath("/parent");
}
