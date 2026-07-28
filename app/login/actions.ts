"use server";

import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const ROLE_LABELS: Record<Role, string> = {
  DIRECTOR: "Director",
  ADMIN: "Admin",
  TEACHER: "Teacher",
  PARENT: "Parent",
};

/** Demo login: picks the first membership with this role and signs in as that user, active at that membership's school. Role now lives on `UserSchool`, not `User` — a user can hold a different role at each school they belong to. */
export async function loginAs(role: Role) {
  const membership = await prisma.userSchool.findFirst({
    where: { role },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    throw new Error(`No ${ROLE_LABELS[role]} account exists yet.`);
  }

  await createSession(membership.userId, membership.schoolId);
  redirect(role === "PARENT" ? "/parent" : "/dashboard");
}
