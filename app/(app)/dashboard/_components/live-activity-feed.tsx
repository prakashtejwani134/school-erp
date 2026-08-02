import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  NotebookPen,
  Settings,
  Tag,
  UserCog,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "../command-center-data";

const ACTION_ICONS: Record<string, LucideIcon> = {
  FEE_COLLECTED: IndianRupee,
  STUDENT_CREATED: UserPlus,
  STUDENT_UPDATED: UserCog,
  STUDENT_DELETED: UserMinus,
  ATTENDANCE_MARKED: CalendarCheck,
  SETTINGS_UPDATED: Settings,
  FEE_CATEGORY_CREATED: Tag,
  FEE_CATEGORY_UPDATED: Tag,
  FEE_CATEGORY_DELETED: Tag,
  EXAM_CREATED: GraduationCap,
  MARKS_ENTERED: NotebookPen,
};

// Scannable-at-a-glance categorization for the leading dot: teal for
// attendance, brass for exams (sparingly, per the design brief), ink-muted
// for everything else — fees/students/settings are frequent, not special.
const ATTENDANCE_ACTIONS = new Set(["ATTENDANCE_MARKED"]);
const EXAM_ACTIONS = new Set(["EXAM_CREATED", "MARKS_ENTERED"]);

function dotColorFor(actionType: string): string {
  if (ATTENDANCE_ACTIONS.has(actionType)) return "bg-primary";
  if (EXAM_ACTIONS.has(actionType)) return "bg-brass";
  return "bg-muted-foreground";
}

export function LiveActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Activity className="size-4 text-muted-foreground" />
          Live Activity Feed
        </CardTitle>
        <CardDescription>Recent actions across the school</CardDescription>
        <CardAction>
          <Button
            size="sm"
            variant="ghost"
            className="h-11 md:h-7"
            nativeButton={false}
            render={<Link href="/audit-logs" />}
          >
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="Nothing's happened yet"
            description="Fee collections, student changes, and attendance will show up here as they happen."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const Icon = ACTION_ICONS[item.actionType] ?? Activity;
              return (
                <div key={item.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
                    <span
                      aria-hidden
                      className={cn("size-1.5 rounded-full", dotColorFor(item.actionType))}
                    />
                    <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-3.5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{item.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.userName} · {item.relativeTime}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
