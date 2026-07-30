import type { Role } from "@prisma/client";

export type NavKey =
  | "dashboard"
  | "students"
  | "classes"
  | "attendance"
  | "exams"
  | "fees"
  | "auditLogs"
  | "settings"
  | "profile";

// Requested spec named these roles DIRECTOR/TEACHER/ACCOUNTANT/STUDENT; the
// actual Role enum is DIRECTOR/ADMIN/TEACHER/PARENT. ADMIN stands in for the
// "accountant" (fees) role here; PARENT gets the minimal "student/guardian"
// view since there's no self-service portal in this app yet.
const ROLE_ACCESS: Record<Role, NavKey[]> = {
  DIRECTOR: [
    "dashboard",
    "students",
    "classes",
    "attendance",
    "exams",
    "fees",
    "auditLogs",
    "settings",
    "profile",
  ],
  ADMIN: ["dashboard", "students", "fees", "profile"],
  TEACHER: ["dashboard", "classes", "attendance", "exams", "profile"],
  PARENT: ["dashboard", "profile"],
};

export function canAccess(role: Role, key: NavKey): boolean {
  return ROLE_ACCESS[role].includes(key);
}

export function navKeysForRole(role: Role): NavKey[] {
  return ROLE_ACCESS[role];
}
