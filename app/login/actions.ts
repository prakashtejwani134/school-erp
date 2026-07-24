"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function loginAsDirector() {
  const director = await prisma.user.findFirst({
    where: { role: "DIRECTOR" },
    orderBy: { createdAt: "asc" },
  });

  if (!director) throw new Error("No director account exists yet.");

  await createSession(director.id);
  redirect("/dashboard");
}
