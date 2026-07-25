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
  feeStatus: FeeStatus;
  pendingDueCount: number;
};

export type ClassOption = {
  id: string;
  name: string;
  section: string;
};
