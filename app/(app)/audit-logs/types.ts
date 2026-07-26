import type { AuditActionType } from "@prisma/client";

export type AuditLogEntry = {
  id: string;
  actionType: AuditActionType;
  targetEntity: string;
  targetId: string | null;
  details: string;
  createdAt: string;
  userName: string;
  ipAddress: string | null;
};
