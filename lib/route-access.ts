import "server-only";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { canAccess, type NavKey } from "@/lib/rbac";
import { getActiveSchoolContext } from "@/lib/school-context";

export type RouteAccess = {
  user: User;
  schoolId: string;
  role: Role;
};

/**
 * Call at the top of a restricted page's Server Component. Redirects to
 * /login if unauthenticated (or if the active schoolId no longer maps to a
 * real membership), or to /dashboard if the signed-in user's role isn't
 * permitted for `key`. Each restricted page must call this itself — the
 * shared (app) layout can't tell which nested page is being rendered.
 *
 * Returns the active `schoolId` so callers can scope their data queries to
 * it — every tenant-owned query in this app must be filtered by this value.
 */
export async function requireRouteAccess(key: NavKey): Promise<RouteAccess> {
  const context = await getActiveSchoolContext();
  if (!context) redirect("/login");

  if (!canAccess(context.role, key)) redirect("/dashboard");

  const user = await prisma.user.findUnique({ where: { id: context.userId } });
  if (!user) redirect("/login");

  return { user, schoolId: context.schoolId, role: context.role };
}
