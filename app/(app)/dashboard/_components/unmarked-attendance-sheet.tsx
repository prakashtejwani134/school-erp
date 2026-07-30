"use client";

import Link from "next/link";
import { CalendarCheck } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ClassAttendanceRadarRow } from "../command-center-data";

export function UnmarkedAttendanceSheet({
  open,
  onOpenChange,
  classes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassAttendanceRadarRow[];
}) {
  const isMobile = useIsMobile();
  const unmarkedClasses = classes.filter((c) => c.unmarkedCount > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("w-full sm:max-w-md", isMobile && "max-h-[85vh] rounded-t-xl")}
      >
        <SheetHeader>
          <SheetTitle>Unmarked Attendance</SheetTitle>
          <SheetDescription>
            Classes that haven&apos;t finished marking attendance today.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2 overflow-y-auto px-4">
          {unmarkedClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every class has marked attendance today.
            </p>
          ) : (
            unmarkedClasses.map((cls) => (
              <div
                key={cls.classId}
                className="flex items-center justify-between rounded-lg border border-input px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium">
                    {cls.name} - {cls.section}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {cls.markedCount} of {cls.totalStudents} marked
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <Badge className="border-transparent bg-red-500/15 text-red-700 dark:text-red-400">
                    {cls.unmarkedCount} unmarked
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-11 md:h-7"
                    nativeButton={false}
                    render={<Link href={`/attendance?classId=${cls.classId}`} />}
                  >
                    <CalendarCheck className="size-3.5" />
                    Mark
                  </Button>
                </span>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
