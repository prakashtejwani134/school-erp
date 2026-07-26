import "server-only";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type SchoolContext = {
  userId: string;
  schoolId: string;
  role: Role;
};

/**
 * Re-verifies the session's active schoolId against a real `UserSchool`
 * membership row — the cookie alone is never trusted. Returns `null` if
 * there's no session, or if the membership no longer exists (removed from
 * the school, or a stale/forged schoolId pointing at a different tenant).
 */
export async function getActiveSchoolContext(): Promise<SchoolContext | null> {
  const session = await getSession();
  if (!session) return null;

  const membership = await prisma.userSchool.findUnique({
    where: {
      userId_schoolId: { userId: session.userId, schoolId: session.schoolId },
    },
  });
  if (!membership) return null;

  return { userId: session.userId, schoolId: session.schoolId, role: membership.role };
}

/** Same as `getActiveSchoolContext`, but throws instead of returning `null` — for Server Actions, which should never `redirect`. */
export async function requireActiveSchoolContext(): Promise<SchoolContext> {
  const context = await getActiveSchoolContext();
  if (!context) {
    throw new Error("Your session is no longer valid for this school. Please sign in again.");
  }
  return context;
}
