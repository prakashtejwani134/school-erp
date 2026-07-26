import { prisma } from "@/lib/prisma";
import { requireRouteAccess } from "@/lib/route-access";
import { AuditLogTable } from "./audit-log-table";
import type { AuditLogEntry } from "./types";

async function getAuditLogs(schoolId: string): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: { schoolId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs.map((log) => ({
    id: log.id,
    actionType: log.actionType,
    targetEntity: log.targetEntity,
    targetId: log.targetId,
    details: log.details,
    createdAt: log.createdAt.toISOString(),
    userName: log.user.name,
    ipAddress: log.ipAddress,
  }));
}

export default async function AuditLogsPage() {
  const { schoolId } = await requireRouteAccess("auditLogs");

  const logs = await getAuditLogs(schoolId);

  return <AuditLogTable logs={logs} />;
}
