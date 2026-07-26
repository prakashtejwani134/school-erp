"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";

/** Switches the active school for the current session. Re-verifies the target is a real membership for the signed-in user before switching — never trusts the schoolId blindly. */
export async function switchActiveSchool(schoolId: string) {
  const session = await getSession();
  if (!session) throw new Error("Your session has expired. Please sign in again.");

  const membership = await prisma.userSchool.findUnique({
    where: { userId_schoolId: { userId: session.userId, schoolId } },
  });
  if (!membership) throw new Error("You don't have access to that school.");

  await createSession(session.userId, schoolId);
  redirect("/dashboard");
}
