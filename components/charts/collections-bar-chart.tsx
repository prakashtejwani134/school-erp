"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatINR } from "@/lib/currency";
import type { MonthlyFinancial } from "@/app/(app)/dashboard/analytics";

// Matches the app's existing semantic colors: emerald = paid/received
// (FeeStatusBadge, payment-mode badges), amber = pending (FeeStatusBadge).
const COLLECTED_COLOR = "#10b981";
const PENDING_COLOR = "#f59e0b";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium tabular-nums text-popover-foreground">
            {formatINR(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function CollectionsBarChart({ data }: { data: MonthlyFinancial[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barCategoryGap="24%" barGap={4}>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="month"
          stroke="var(--border)"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--border)"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) =>
            value >= 100000 ? `${Math.round(value / 100000)}L` : `${value}`
          }
          width={40}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
        <Bar
          dataKey="collected"
          name="Collected"
          fill={COLLECTED_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="pending"
          name="Pending"
          fill={PENDING_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
