import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";
import type { FeeCategoryRuleRow, SchoolSettingsData } from "./types";

export default async function SettingsPage() {
  const settings = await prisma.schoolSettings.findFirst({
    include: { feeCategories: { orderBy: { createdAt: "asc" } } },
  });

  const schoolSettings: SchoolSettingsData | null = settings
    ? {
        id: settings.id,
        schoolName: settings.schoolName,
        logoUrl: settings.logoUrl,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        currency: settings.currency,
        currentAcademicYear: settings.currentAcademicYear,
      }
    : null;

  const feeCategories: FeeCategoryRuleRow[] =
    settings?.feeCategories.map((rule) => ({
      id: rule.id,
      name: rule.name,
      amount: rule.amount,
      frequency: rule.frequency,
      lateFeePercentage: rule.lateFeePercentage,
    })) ?? [];

  return (
    <SettingsClient schoolSettings={schoolSettings} feeCategories={feeCategories} />
  );
}
