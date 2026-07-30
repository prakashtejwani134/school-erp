import { prisma } from "@/lib/prisma";
import { requireRouteAccess } from "@/lib/route-access";
import { SettingsClient } from "./settings-client";
import type { FeeCategoryRuleRow, SchoolSettingsData, SubjectRow } from "./types";

export default async function SettingsPage() {
  const { schoolId } = await requireRouteAccess("settings");

  const school = await prisma.school.findUniqueOrThrow({
    where: { id: schoolId },
    include: {
      feeCategories: { orderBy: { createdAt: "asc" } },
      subjects: { orderBy: { name: "asc" } },
    },
  });

  const schoolSettings: SchoolSettingsData = {
    id: school.id,
    schoolName: school.schoolName,
    logoUrl: school.logoUrl,
    address: school.address,
    phone: school.phone,
    email: school.email,
    currency: school.currency,
    currentAcademicYear: school.currentAcademicYear,
  };

  const feeCategories: FeeCategoryRuleRow[] = school.feeCategories.map((rule) => ({
    id: rule.id,
    name: rule.name,
    amount: rule.amount,
    frequency: rule.frequency,
    lateFeePercentage: rule.lateFeePercentage,
  }));

  const subjects: SubjectRow[] = school.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));

  return (
    <SettingsClient
      schoolSettings={schoolSettings}
      feeCategories={feeCategories}
      subjects={subjects}
    />
  );
}
