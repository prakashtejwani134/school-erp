import "server-only";
import type { Role, Student } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type ParentContext = {
  userId: string;
  schoolId: string;
  role: Role;
  students: Student[];
};

/**
 * Same shape of check as `getActiveSchoolContext`, but additionally requires
 * the membership's role to be PARENT, and resolves the `Student` rows linked
 * to this user via `Student.guardianId` at this school. Returns `null` if
 * there's no session, the membership no longer exists, or the role at this
 * school isn't PARENT.
 */
export async function getParentContext(): Promise<ParentContext | null> {
  const session = await getSession();
  if (!session) return null;

  const membership = await prisma.userSchool.findUnique({
    where: {
      userId_schoolId: { userId: session.userId, schoolId: session.schoolId },
    },
  });
  if (!membership || membership.role !== "PARENT") return null;

  const students = await prisma.student.findMany({
    where: { schoolId: session.schoolId, guardianId: session.userId },
  });

  return {
    userId: session.userId,
    schoolId: session.schoolId,
    role: membership.role,
    students,
  };
}

/** Same as `getParentContext`, but throws instead of returning `null` — for Server Actions, which should never `redirect`. */
export async function requireParentContext(): Promise<ParentContext> {
  const context = await getParentContext();
  if (!context) {
    throw new Error("Your session is no longer valid for this school. Please sign in again.");
  }
  return context;
}
