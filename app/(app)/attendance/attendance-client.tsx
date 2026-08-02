"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AttendanceStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendancePillToggle } from "@/components/ui/attendance-pill-toggle";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";

import { saveAttendance } from "./actions";

export type ClassOption = { id: string; name: string; section: string };

export type StudentAttendanceRow = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  status: AttendanceStatus;
};

function AttendanceFilters({
  classes,
  selectedClassId,
  selectedDate,
}: {
  classes: ClassOption[];
  selectedClassId: string;
  selectedDate: string;
}) {
  const router = useRouter();

  function navigate(next: { classId?: string; date?: string }) {
    const params = new URLSearchParams({
      classId: next.classId ?? selectedClassId,
      date: next.date ?? selectedDate,
    });
    router.push(`/attendance?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor="class-select">Class</Label>
        <Select
          value={selectedClassId}
          onValueChange={(value) => value && navigate({ classId: value })}
        >
          <SelectTrigger id="class-select" className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}-{c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="date-input">Date</Label>
        <Input
          id="date-input"
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && navigate({ date: e.target.value })}
          className="w-full sm:w-44"
        />
      </div>
    </div>
  );
}

function AttendanceMarkingList({
  students,
  selectedDate,
  classLabel,
}: {
  students: StudentAttendanceRow[];
  selectedDate: string;
  classLabel: string;
}) {
  const router = useRouter();
  const [statuses, setStatuses] = React.useState<
    Record<string, AttendanceStatus>
  >(() => Object.fromEntries(students.map((s) => [s.id, s.status])));
  const [isPending, startTransition] = React.useTransition();

  const allPresent =
    students.length > 0 &&
    students.every((s) => statuses[s.id] === "PRESENT");

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAllPresent() {
    setStatuses(
      Object.fromEntries(students.map((s) => [s.id, "PRESENT" as const])),
    );
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveAttendance(
          selectedDate,
          students.map((s) => ({ studentId: s.id, status: statuses[s.id] })),
          classLabel,
        );
        toast.success("Attendance saved");
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to save attendance.",
        );
      }
    });
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="No students in this class yet"
            description="Attendance can be marked once students are enrolled in this class."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            {students.length} student{students.length === 1 ? "" : "s"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="mark-all-present"
            className="text-sm font-normal text-muted-foreground"
          >
            Mark all Present
          </Label>
          <Switch
            id="mark-all-present"
            checked={allPresent}
            onCheckedChange={(checked) => {
              if (checked) markAllPresent();
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 px-0">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex flex-col gap-2 border-t px-6 py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {student.admissionNo}
              </p>
            </div>
            <AttendancePillToggle
              value={statuses[student.id]}
              onChange={(status) => setStatus(student.id, status)}
              groupId={student.id}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end border-t pt-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function AttendanceClient({
  classes,
  selectedClassId,
  selectedDate,
  students,
}: {
  classes: ClassOption[];
  selectedClassId: string;
  selectedDate: string;
  students: StudentAttendanceRow[];
}) {
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classLabel = selectedClass
    ? `${selectedClass.name}-${selectedClass.section}`
    : "Unknown";

  return (
    <div className="flex flex-col gap-4">
      <AttendanceFilters
        classes={classes}
        selectedClassId={selectedClassId}
        selectedDate={selectedDate}
      />
      <AttendanceMarkingList
        key={`${selectedClassId}-${selectedDate}`}
        students={students}
        selectedDate={selectedDate}
        classLabel={classLabel}
      />
    </div>
  );
}
