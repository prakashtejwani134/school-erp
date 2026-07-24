"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type StudentInput = {
  firstName: string;
  lastName: string;
  admissionNo: string;
  parentPhone: string;
  classId: string;
  isDiscounted: boolean;
};

function parseStudentForm(formData: FormData): StudentInput {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const admissionNo = String(formData.get("admissionNo") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();
  const classId = String(formData.get("classId") ?? "").trim();
  const isDiscounted = formData.get("isDiscounted") === "on";

  if (!firstName) throw new Error("First name is required.");
  if (!lastName) throw new Error("Last name is required.");
  if (!admissionNo) throw new Error("Admission number is required.");
  if (!parentPhone) throw new Error("Parent phone is required.");
  if (!classId) throw new Error("Class is required.");

  return { firstName, lastName, admissionNo, parentPhone, classId, isDiscounted };
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
  const data = parseStudentForm(formData);

  try {
    await prisma.student.create({ data });
  } catch (error) {
    throw friendlyDbError(error, "Failed to create student.");
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
}

export async function updateStudent(id: string, formData: FormData) {
  const data = parseStudentForm(formData);

  try {
    await prisma.student.update({ where: { id }, data });
  } catch (error) {
    throw friendlyDbError(error, "Failed to update student.");
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
}

export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({ where: { id } });
  } catch (error) {
    throw friendlyDbError(
      error,
      "Failed to delete student. They may have related fee or attendance records.",
    );
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
}
