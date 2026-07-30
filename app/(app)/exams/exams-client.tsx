"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { computeGrade, computePercentage } from "@/lib/grades";

import { createExam, getMarksForExamSubject, saveMarks } from "./actions";
import type { ClassOption, ExamRow, MarkEntryRow, SubjectOption } from "./types";

function CreateExamCard({ classes }: { classes: ClassOption[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [examDate, setExamDate] = React.useState("");
  const [classId, setClassId] = React.useState(classes[0]?.id ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("Exam name is required.");
      return;
    }
    if (!examDate) {
      setError("Exam date is required.");
      return;
    }
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("name", name.trim());
        formData.set("examDate", examDate);
        formData.set("classId", classId);
        await createExam(formData);
        toast.success("Exam created");
        setName("");
        setExamDate("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Exam</CardTitle>
        <CardDescription>
          One exam sitting for a single class — enter marks for it below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="exam-name">Exam name</Label>
            <Input
              id="exam-name"
              placeholder="Mid-Term 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exam-class">Class</Label>
            <Select
              value={classId}
              onValueChange={(v) => v && setClassId(v)}
              items={classes.map((c) => ({
                value: c.id,
                label: `${c.name}-${c.section}`,
              }))}
            >
              <SelectTrigger id="exam-class" className="w-full">
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
            <Label htmlFor="exam-date">Exam date</Label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-end border-t pt-4">
        <Button onClick={handleSubmit} disabled={isPending}>
          <Plus />
          {isPending ? "Creating..." : "Create Exam"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ExamsListCard({ exams }: { exams: ExamRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exams</CardTitle>
        <CardDescription>All exams created for this school.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length ? (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.className}</TableCell>
                    <TableCell className="text-right">
                      {exam.examDate}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No exams yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function MarksEntryCard({
  exams,
  subjects,
}: {
  exams: ExamRow[];
  subjects: SubjectOption[];
}) {
  const router = useRouter();
  const [examId, setExamId] = React.useState(exams[0]?.id ?? "");
  const [subjectId, setSubjectId] = React.useState(subjects[0]?.id ?? "");
  const [maxMarks, setMaxMarks] = React.useState("100");
  const [rows, setRows] = React.useState<MarkEntryRow[]>([]);
  const [marksInput, setMarksInput] = React.useState<Record<string, string>>(
    {},
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const loadRows = React.useCallback(async (exam: string, subject: string) => {
    if (!exam || !subject) {
      setRows([]);
      setMarksInput({});
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMarksForExamSubject(exam, subject);
      setRows(result);
      setMarksInput(
        Object.fromEntries(
          result.map((r) => [
            r.studentId,
            r.marksObtained !== null ? String(r.marksObtained) : "",
          ]),
        ),
      );
      const existingMaxMarks = result.find((r) => r.marksObtained !== null);
      if (existingMaxMarks) setMaxMarks(String(existingMaxMarks.maxMarks));
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to load students.",
      );
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Fetching from the server on mount, not deriving state from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRows(examId, subjectId);
    // Runs once per mount — filter changes are handled by the explicit
    // handlers below, which call loadRows themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleExamChange(value: string) {
    setExamId(value);
    loadRows(value, subjectId);
  }

  function handleSubjectChange(value: string) {
    setSubjectId(value);
    loadRows(examId, value);
  }

  function handleSave() {
    setError(null);
    const maxMarksValue = Number(maxMarks);
    if (!Number.isFinite(maxMarksValue) || maxMarksValue <= 0) {
      setError("Max marks must be a positive number.");
      return;
    }

    const records: { studentId: string; marksObtained: number }[] = [];
    for (const row of rows) {
      const raw = marksInput[row.studentId];
      if (raw === undefined || raw.trim() === "") continue;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0 || value > maxMarksValue) {
        setError(
          `${row.firstName} ${row.lastName}: marks must be between 0 and ${maxMarksValue}.`,
        );
        return;
      }
      records.push({ studentId: row.studentId, marksObtained: value });
    }

    if (records.length === 0) {
      setError("Enter at least one student's marks before saving.");
      return;
    }

    startTransition(async () => {
      try {
        await saveMarks(examId, subjectId, maxMarksValue, records);
        toast.success(
          `Marks saved for ${records.length} student${records.length === 1 ? "" : "s"}`,
        );
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save marks.");
      }
    });
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Marks</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Create an exam above before entering marks.
        </CardContent>
      </Card>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Marks</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Add at least one subject in{" "}
          <Link href="/settings" className="underline">
            Settings
          </Link>{" "}
          before entering marks.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Marks</CardTitle>
        <CardDescription>
          Select an exam and subject, then enter each student&apos;s score.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="marks-exam">Exam</Label>
            <Select
              value={examId}
              onValueChange={(v) => v && handleExamChange(v)}
              items={exams.map((exam) => ({
                value: exam.id,
                label: `${exam.name} (${exam.className})`,
              }))}
            >
              <SelectTrigger id="marks-exam" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name} ({exam.className})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="marks-subject">Subject</Label>
            <Select
              value={subjectId}
              onValueChange={(v) => v && handleSubjectChange(v)}
              items={subjects.map((s) => ({ value: s.id, label: s.name }))}
            >
              <SelectTrigger id="marks-subject" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="max-marks">Max marks</Label>
            <Input
              id="max-marks"
              type="number"
              min="1"
              step="1"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="w-full sm:w-28"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading students...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No students in this exam&apos;s class.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead className="w-32 text-right">
                    Marks Obtained
                  </TableHead>
                  <TableHead className="w-16 text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const rawValue = marksInput[row.studentId] ?? "";
                  const numericValue = Number(rawValue);
                  const maxMarksValue = Number(maxMarks);
                  const hasValidPreview =
                    rawValue.trim() !== "" &&
                    Number.isFinite(numericValue) &&
                    Number.isFinite(maxMarksValue) &&
                    maxMarksValue > 0;

                  return (
                    <TableRow key={row.studentId}>
                      <TableCell className="font-medium">
                        {row.firstName} {row.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.admissionNo}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          max={maxMarks}
                          step="0.01"
                          value={rawValue}
                          onChange={(e) =>
                            setMarksInput((prev) => ({
                              ...prev,
                              [row.studentId]: e.target.value,
                            }))
                          }
                          className="ml-auto w-24 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {hasValidPreview
                          ? computeGrade(
                              computePercentage(numericValue, maxMarksValue),
                            )
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
      <CardFooter className="justify-end border-t pt-4">
        <Button onClick={handleSave} disabled={isPending || rows.length === 0}>
          {isPending ? "Saving..." : "Save Marks"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ExamsClient({
  classes,
  subjects,
  exams,
}: {
  classes: ClassOption[];
  subjects: SubjectOption[];
  exams: ExamRow[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <CreateExamCard classes={classes} />
      <ExamsListCard exams={exams} />
      <MarksEntryCard exams={exams} subjects={subjects} />
    </div>
  );
}
