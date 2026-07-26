import type { AuditActionType } from "@prisma/client";

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  FEE_COLLECTED: "Fee Collected",
  STUDENT_CREATED: "Student Added",
  STUDENT_UPDATED: "Student Updated",
  STUDENT_DELETED: "Student Removed",
  ATTENDANCE_MARKED: "Attendance Marked",
  SETTINGS_UPDATED: "School Settings Updated",
  FEE_CATEGORY_CREATED: "Fee Category Added",
  FEE_CATEGORY_UPDATED: "Fee Category Updated",
  FEE_CATEGORY_DELETED: "Fee Category Removed",
};

export const AUDIT_ACTION_BADGE_STYLES: Record<AuditActionType, string> = {
  FEE_COLLECTED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  STUDENT_CREATED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  STUDENT_UPDATED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  STUDENT_DELETED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  ATTENDANCE_MARKED: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  SETTINGS_UPDATED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  FEE_CATEGORY_CREATED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  FEE_CATEGORY_UPDATED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  FEE_CATEGORY_DELETED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};
