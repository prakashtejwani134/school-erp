import { BadgePercent, CalendarDays, MapPin, Phone } from "lucide-react";

import { FeeStatusBadge } from "./columns";
import type { StudentRow } from "./types";

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function StudentRowDetail({ student }: { student: StudentRow }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DetailField icon={Phone} label="Parent Contact" value={student.parentPhone} />
      <DetailField
        icon={MapPin}
        label="Address"
        value={student.address ?? "Not on file"}
      />
      <DetailField
        icon={CalendarDays}
        label="Enrolled"
        value={student.enrolledAt}
      />
      <div className="flex items-start gap-2">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Fee Status</p>
          <FeeStatusBadge
            status={student.feeStatus}
            pendingDueCount={student.pendingDueCount}
          />
        </div>
      </div>
      {student.isDiscounted ? (
        <DetailField
          icon={BadgePercent}
          label="Concession Reason"
          value={student.concessionReason ?? "Not on file"}
        />
      ) : null}
    </div>
  );
}
