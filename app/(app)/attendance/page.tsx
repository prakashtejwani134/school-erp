import { CalendarCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PlaceholderPage } from "@/components/placeholder-page";
import { AttendanceClient } from "./attendance-client";
import { parseDateParam, todayParam } from "@/lib/date";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const params = await searchParams;

  const classes = await prisma.class.findMany({
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });

  if (classes.length === 0) {
    return (
      <PlaceholderPage
        title="Attendance"
        description="Add a class before you can take attendance."
        icon={CalendarCheck}
      />
    );
  }

  const selectedClassId =
    params.classId && classes.some((c) => c.id === params.classId)
      ? params.classId
      : classes[0].id;
  const selectedDate = params.date || todayParam();
  const dateObj = parseDateParam(selectedDate);

  const students = await prisma.student.findMany({
    where: { classId: selectedClassId },
    orderBy: [{ firstName: "asc" }],
    include: {
      attendances: {
        where: { date: dateObj },
        select: { status: true },
      },
    },
  });

  const studentRows = students.map((student) => ({
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    admissionNo: student.admissionNo,
    status: student.attendances[0]?.status ?? "PRESENT",
  }));

  const classOptions = classes.map((c) => ({
    id: c.id,
    name: c.name,
    section: c.section,
  }));

  return (
    <AttendanceClient
      classes={classOptions}
      selectedClassId={selectedClassId}
      selectedDate={selectedDate}
      students={studentRows}
    />
  );
}
