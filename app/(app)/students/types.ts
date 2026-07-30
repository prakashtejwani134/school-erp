export type FeeStatus = "PAID" | "PENDING" | "NONE";

export type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  parentPhone: string;
  address: string | null;
  enrolledAt: string;
  classId: string;
  className: string;
  isDiscounted: boolean;
  concessionReason: string | null;
  feeStatus: FeeStatus;
  pendingDueCount: number;
};

export type ClassOption = {
  id: string;
  name: string;
  section: string;
};

export type SchoolBranding = {
  schoolName: string;
  logoUrl: string | null;
  currentAcademicYear: string;
};
