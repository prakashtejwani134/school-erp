"use server";

import { revalidatePath } from "next/cache";
import { Prisma, FeeFrequency } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActiveSchoolContext } from "@/lib/school-context";

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

/** Updates the active school's own details. The School row always exists once a membership does — there's no "create the first settings row" branch anymore. */
export async function saveSchoolSettings(formData: FormData) {
  const { schoolId } = await requireActiveSchoolContext();
  const data = parseSchoolSettingsForm(formData);

  const settings = await prisma.school.update({ where: { id: schoolId }, data });

  await logAudit({
    actionType: "SETTINGS_UPDATED",
    targetEntity: "School",
    targetId: settings.id,
    details: `${data.schoolName} details saved`,
  });

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

export async function createFeeCategoryRule(formData: FormData) {
  const { schoolId } = await requireActiveSchoolContext();
  const data = parseFeeCategoryRuleForm(formData);

  let created;
  try {
    created = await prisma.feeCategoryRule.create({
      data: { ...data, schoolId },
    });
  } catch (error) {
    throw friendlyDbError(error, "Failed to create fee category.");
  }

  await logAudit({
    actionType: "FEE_CATEGORY_CREATED",
    targetEntity: "FeeCategoryRule",
    targetId: created.id,
    details: `${data.name} — ${data.amount} (${data.frequency})`,
  });

  revalidatePath("/settings");
}

export async function updateFeeCategoryRule(id: string, formData: FormData) {
  const { schoolId } = await requireActiveSchoolContext();
  const data = parseFeeCategoryRuleForm(formData);

  let count: number;
  try {
    ({ count } = await prisma.feeCategoryRule.updateMany({
      where: { id, schoolId },
      data,
    }));
  } catch (error) {
    throw friendlyDbError(error, "Failed to update fee category.");
  }
  if (count === 0) throw new Error("This fee category no longer exists.");

  await logAudit({
    actionType: "FEE_CATEGORY_UPDATED",
    targetEntity: "FeeCategoryRule",
    targetId: id,
    details: `${data.name} — ${data.amount} (${data.frequency})`,
  });

  revalidatePath("/settings");
}

export async function deleteFeeCategoryRule(id: string) {
  const { schoolId } = await requireActiveSchoolContext();

  const rule = await prisma.feeCategoryRule.findFirst({ where: { id, schoolId } });
  if (!rule) throw new Error("This fee category no longer exists.");

  try {
    await prisma.feeCategoryRule.delete({ where: { id: rule.id } });
  } catch (error) {
    throw friendlyDbError(error, "Failed to delete fee category.");
  }

  await logAudit({
    actionType: "FEE_CATEGORY_DELETED",
    targetEntity: "FeeCategoryRule",
    targetId: rule.id,
    details: rule.name,
  });

  revalidatePath("/settings");
}
