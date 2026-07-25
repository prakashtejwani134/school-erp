import type { FeeFrequency } from "@prisma/client";

export type SchoolSettingsData = {
  id: string;
  schoolName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  currency: string;
  currentAcademicYear: string;
};

export type FeeCategoryRuleRow = {
  id: string;
  name: string;
  amount: number;
  frequency: FeeFrequency;
  lateFeePercentage: number;
};
