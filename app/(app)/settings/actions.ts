"use server";

import { revalidatePath } from "next/cache";
import { Prisma, FeeFrequency } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type SchoolSettingsInput = {
  schoolName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  currency: string;
  currentAcademicYear: string;
};

function parseSchoolSettingsForm(formData: FormData): SchoolSettingsInput {
  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const currentAcademicYear = String(
    formData.get("currentAcademicYear") ?? "",
  ).trim();

  if (!schoolName) throw new Error("School name is required.");
  if (!address) throw new Error("Address is required.");
  if (!phone) throw new Error("Phone is required.");
  if (!email) throw new Error("Email is required.");
  if (!currency) throw new Error("Currency is required.");
  if (!currentAcademicYear) throw new Error("Academic year is required.");

  return {
    schoolName,
    logoUrl: logoUrl || null,
    address,
    phone,
    email,
    currency,
    currentAcademicYear,
  };
}

export async function saveSchoolSettings(id: string | null, formData: FormData) {
  const data = parseSchoolSettingsForm(formData);

  if (id) {
    await prisma.schoolSettings.update({ where: { id }, data });
  } else {
    await prisma.schoolSettings.create({ data });
  }

  revalidatePath("/settings");
}

type FeeCategoryRuleInput = {
  name: string;
  amount: number;
  frequency: FeeFrequency;
  lateFeePercentage: number;
};

function parseFeeCategoryRuleForm(formData: FormData): FeeCategoryRuleInput {
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const frequency = String(formData.get("frequency") ?? "") as FeeFrequency;
  const lateFeePercentageRaw = formData.get("lateFeePercentage");
  const lateFeePercentage = lateFeePercentageRaw
    ? Number(lateFeePercentageRaw)
    : 0;

  if (!name) throw new Error("Fee category name is required.");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  if (!Object.values(FeeFrequency).includes(frequency)) {
    throw new Error("A valid frequency is required.");
  }
  if (!Number.isFinite(lateFeePercentage) || lateFeePercentage < 0) {
    throw new Error("Late fee percentage must be zero or more.");
  }

  return { name, amount, frequency, lateFeePercentage };
}

function friendlyDbError(error: unknown, fallback: string): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return new Error("This fee category no longer exists.");
    }
  }
  return new Error(fallback);
}

export async function createFeeCategoryRule(
  schoolSettingsId: string,
  formData: FormData,
) {
  const data = parseFeeCategoryRuleForm(formData);

  try {
    await prisma.feeCategoryRule.create({
      data: { ...data, schoolSettingsId },
    });
  } catch (error) {
    throw friendlyDbError(error, "Failed to create fee category.");
  }

  revalidatePath("/settings");
}

export async function updateFeeCategoryRule(id: string, formData: FormData) {
  const data = parseFeeCategoryRuleForm(formData);

  try {
    await prisma.feeCategoryRule.update({ where: { id }, data });
  } catch (error) {
    throw friendlyDbError(error, "Failed to update fee category.");
  }

  revalidatePath("/settings");
}

export async function deleteFeeCategoryRule(id: string) {
  try {
    await prisma.feeCategoryRule.delete({ where: { id } });
  } catch (error) {
    throw friendlyDbError(error, "Failed to delete fee category.");
  }

  revalidatePath("/settings");
}
