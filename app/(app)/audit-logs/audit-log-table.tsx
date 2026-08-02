"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { AuditActionType } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/app/(app)/students/data-table";
import { AUDIT_ACTION_LABELS } from "@/lib/audit-labels";

import { getColumns } from "./columns";
import type { AuditLogEntry } from "./types";

const REFRESH_INTERVAL_MS = 20_000;
const ALL_VALUE = "ALL";

export function AuditLogTable({ logs }: { logs: AuditLogEntry[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [actionType, setActionType] = React.useState<string>(ALL_VALUE);
  const [targetEntity, setTargetEntity] = React.useState<string>(ALL_VALUE);

  React.useEffect(() => {
    const refreshTimer = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimer);
  }, [router]);

  const targetEntities = React.useMemo(
    () => Array.from(new Set(logs.map((log) => log.targetEntity))).sort(),
    [logs],
  );

  const filteredLogs = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (actionType !== ALL_VALUE && log.actionType !== actionType) return false;
      if (targetEntity !== ALL_VALUE && log.targetEntity !== targetEntity)
        return false;
      if (!query) return true;
      return (
        log.userName.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query)
      );
    });
  }, [logs, search, actionType, targetEntity]);

  const columns = React.useMemo(() => getColumns(), []);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user or details..."
              className="pl-8"
            />
          </div>
          <Select
            value={actionType}
            onValueChange={(value) => value && setActionType(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All actions</SelectItem>
              {(Object.keys(AUDIT_ACTION_LABELS) as AuditActionType[]).map(
                (type) => (
                  <SelectItem key={type} value={type}>
                    {AUDIT_ACTION_LABELS[type]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select
            value={targetEntity}
            onValueChange={(value) => value && setTargetEntity(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All targets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All targets</SelectItem>
              {targetEntities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredLogs.length} of {logs.length}
          </span>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredLogs}
        getRowId={(row) => row.id}
        emptyMessage={
          logs.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Every fee collection, student change, and settings update will show up here, attributed to whoever made it."
            />
          ) : (
            <EmptyState
              title="No activity matches your filters"
              description="Try a different search, action type, or entity."
            />
          )
        }
      />
    </div>
  );
}
