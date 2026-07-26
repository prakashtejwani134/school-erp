import { headers } from "next/headers";
import type { AuditActionType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveSchoolContext } from "@/lib/school-context";

type LogAuditInput = {
  actionType: AuditActionType;
  targetEntity: string;
  targetId?: string;
  details: string;
};

/** Records one row in the audit trail, attributed to the signed-in user and their active school. Silently no-ops if there's no valid session/membership (shouldn't happen — actions are only reachable from behind the auth-gated layout). */
export async function logAudit({
  actionType,
  targetEntity,
  targetId,
  details,
}: LogAuditInput): Promise<void> {
  const context = await getActiveSchoolContext();
  if (!context) return;

  let ipAddress: string | null = null;
  try {
    const headerList = await headers();
    ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  } catch {
    ipAddress = null;
  }

  await prisma.auditLog.create({
    data: {
      schoolId: context.schoolId,
      userId: context.userId,
      actionType,
      targetEntity,
      targetId,
      details,
      ipAddress,
    },
  });
}
