"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageFadeIn } from "@/components/motion/fade-in";

import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { StudentFormDialog } from "./student-form-dialog";
import type { ClassOption, StudentRow } from "./types";

export function StudentsClient({
  students,
  classes,
}: {
  students: StudentRow[];
  classes: ClassOption[];
}) {
  const [search, setSearch] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<StudentRow | null>(
    null,
  );
  const [deletingStudent, setDeletingStudent] =
    React.useState<StudentRow | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesName = query
        ? `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(query)
        : true;
      const matchesClass =
        classFilter === "all" || student.classId === classFilter;
      return matchesName && matchesClass;
    });
  }, [students, search, classFilter]);

  const columns = React.useMemo(
    () =>
      getColumns({
        onEdit: (student) => {
          setEditingStudent(student);
          setFormKey((k) => k + 1);
          setFormOpen(true);
        },
        onDeleteRequest: (student) => setDeletingStudent(student),
      }),
    [],
  );

  return (
    <PageFadeIn className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={classFilter}
            onValueChange={(value) => setClassFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}-{c.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setFormKey((k) => k + 1);
            setFormOpen(true);
          }}
        >
          <Plus />
          Add Student
        </Button>
      </div>

      <DataTable columns={columns} data={filtered} />

      <StudentFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        classes={classes}
        student={editingStudent}
      />

      <DeleteStudentDialog
        student={deletingStudent}
        onOpenChange={(open) => {
          if (!open) setDeletingStudent(null);
        }}
      />
    </PageFadeIn>
  );
}
