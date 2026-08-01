"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatINR } from "@/lib/currency";
import type { FeeCategoryShare } from "@/app/(app)/dashboard/analytics";

// "The Registrar" tokens only — no default recharts blue/purple/green/
// orange. A tint/shade ramp built entirely from --accent (teal) via
// color-mix, with --brass spent once (sparingly, per the design brief) on
// the last real category slot. "Other" always gets neutral ink-muted gray
// since it's an aggregated fold, not a real category. Fixed categorical
// order (never cycled/reassigned by rank).
const CATEGORY_COLORS = [
  "var(--primary)",
  "color-mix(in oklch, var(--primary), white 35%)",
  "color-mix(in oklch, var(--primary), black 20%)",
  "color-mix(in oklch, var(--primary), white 60%)",
  "var(--brass)",
];
const OTHER_COLOR = "var(--muted-foreground)";

function colorForIndex(category: string, index: number): string {
  if (category === "Other") return OTHER_COLOR;
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="flex items-center gap-1.5">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: entry.payload.fill }}
        />
        <span className="font-medium text-popover-foreground">
          {entry.name}
        </span>
      </p>
      <p className="mt-0.5 font-medium tabular-nums text-popover-foreground">
        {formatINR(entry.value)}
      </p>
    </div>
  );
}

export function FeeCategoryDonut({ data }: { data: FeeCategoryShare[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (total === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No fee collections recorded yet.
      </div>
    );
  }

  const chartData = data.map((d, index) => ({
    ...d,
    fill: colorForIndex(d.category, index),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          strokeWidth={2}
          stroke="var(--card)"
          label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
          labelLine={false}
        >
          {chartData.map((entry) => (
            <Cell key={entry.category} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
