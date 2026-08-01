import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Sparkline } from "@/components/ui/sparkline";

export function ProgressStatCard({
  title,
  description,
  value,
  ringLabel,
  trend,
}: {
  title: string;
  description: string;
  value: number | null;
  ringLabel: string;
  trend?: number[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-(--card-spacing) pb-(--card-spacing)">
        <ProgressRing value={value} label={ringLabel} />
        {trend && trend.length >= 2 ? <Sparkline data={trend} className="w-full" /> : null}
      </div>
    </Card>
  );
}
