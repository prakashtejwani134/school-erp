"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActiveSchoolContext } from "@/lib/school-context";

type StudentInput = {
  firstName: string;
  lastName: string;
  admissionNo: string;
  parentPhone: string;
  address: string | null;
  classId: string;
  isDiscounted: boolean;
  concessionReason: string | null;
};

function parseStudentForm(formData: FormData): StudentInput {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const admissionNo = String(formData.get("admissionNo") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const classId = String(formData.get("classId") ?? "").trim();
  const isDiscounted = formData.get("isDiscounted") === "on";
  const concessionReason = String(formData.get("concessionReason") ?? "").trim();

  if (!firstName) throw new Error("First name is required.");
  if (!lastName) throw new Error("Last name is required.");
  if (!admissionNo) throw new Error("Admission number is required.");
  if (!parentPhone) throw new Error("Parent phone is required.");
  if (!classId) throw new Error("Class is required.");
  if (isDiscounted && !concessionReason) {
    throw new Error("A reason is required to grant a fee concession.");
  }

  return {
    firstName,
    lastName,
    admissionNo,
    parentPhone,
    address: address || null,
    classId,
    isDiscounted,
    concessionReason: isDiscounted ? concessionReason : null,
  };
}

function friendlyDbError(error: unknown, fallback: string): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return new Error("A student with this admission number already exists.");
    }
    if (error.code === "P2003" || error.code === "P2025") {
      return new Error(
        "This student has related fee or attendance records and can't be removed.",
      );
    }
  }
  return new Error(fallback);
}

export async function createStudent(formData: FormData) {
  const { schoolId, userId } = await requireActiveSchoolContext();
  const data = parseStudentForm(formData);

  const classBelongsToSchool = await prisma.class.count({
    where: { id: data.classId, schoolId },
  });
  if (!classBelongsToSchool) throw new Error("Invalid class.");

  let created;
  try {
    created = await prisma.student.create({
      data: {
        ...data,
        schoolId,
        concessionApprovedBy: data.isDiscounted ? userId : null,
        concessionGrantedAt: data.isDiscounted ? new Date() : null,
      },
    });
  } catch (error) {
    throw friendlyDbError(error, "Failed to create student.");
  }

  await logAudit({
    actionType: "STUDENT_CREATED",
    targetEntity: "Student",
    targetId: created.id,
    details: `${data.firstName} ${data.lastName} (${data.admissionNo})`,
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
}

export async function updateStudent(id: string, formData: FormData) {
  const { schoolId, userId } = await requireActiveSchoolContext();
  const data = parseStudentForm(formData);

  const classBelongsToSchool = await prisma.class.count({
    where: { id: data.classId, schoolId },
  });
  if (!classBelongsToSchool) throw new Error("Invalid class.");

  const existing = await prisma.student.findFirst({
    where: { id, schoolId },
    select: { isDiscounted: true, concessionReason: true, concessionApprovedBy: true, concessionGrantedAt: true },
  });
  if (!existing) throw new Error("This student no longer exists.");

  // Only re-stamp the approver/grant date when the concession is newly
  // granted or its reason changed — an unrelated edit (e.g. address) by a
  // different staff member shouldn't silently reassign who approved it.
  const isNewOrChangedConcession =
    data.isDiscounted &&
    (!existing.isDiscounted || existing.concessionReason !== data.concessionReason);

  const concessionApprovedBy = !data.isDiscounted
    ? null
    : isNewOrChangedConcession
      ? userId
      : existing.concessionApprovedBy;
  const concessionGrantedAt = !data.isDiscounted
    ? null
    : isNewOrChangedConcession
      ? new Date()
      : existing.concessionGrantedAt;

  let count: number;
  try {
    ({ count } = await prisma.student.updateMany({
      where: { id, schoolId },
      data: { ...data, concessionApprovedBy, concessionGrantedAt },
    }));
  } catch (error) {
    throw friendlyDbError(error, "Failed to update student.");
  }
  if (count === 0) throw new Error("This student no longer exists.");

  await logAudit({
    actionType: "STUDENT_UPDATED",
    targetEntity: "Student",
    targetId: id,
    details: `${data.firstName} ${data.lastName} (${data.admissionNo})`,
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
}

export async function deleteStudent(id: string) {
  const { schoolId } = await requireActiveSchoolContext();

  const student = await prisma.student.findFirst({ where: { id, schoolId } });
  if (!student) throw new Error("This student no longer exists.");

  try {
    await prisma.student.delete({ where: { id: student.id } });
  } catch (error) {
    throw friendlyDbError(
      error,
      "Failed to delete student. They may have related fee or attendance records.",
    );
  }

  await logAudit({
    actionType: "STUDENT_DELETED",
    targetEntity: "Student",
    targetId: student.id,
    details: `${student.firstName} ${student.lastName} (${student.admissionNo})`,
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
}
