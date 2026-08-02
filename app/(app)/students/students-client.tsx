"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { StudentFormDialog } from "./student-form-dialog";
import { StudentRowDetail } from "./student-row-detail";
import type { ClassOption, SchoolBranding, StudentRow } from "./types";

export function StudentsClient({
  students,
  classes,
  branding,
}: {
  students: StudentRow[];
  classes: ClassOption[];
  branding: SchoolBranding;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    // Syncing dialog-open state to the ?action= query param set by the
    // command palette / other pages — a legitimate external-system sync,
    // not derivable state, so setState-in-effect is intentional here.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (searchParams.get("action") === "new") {
      setEditingStudent(null);
      setFormKey((k) => k + 1);
      setFormOpen(true);
      router.replace("/students", { scroll: false });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  function openAddStudent() {
    setEditingStudent(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

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
    <div className="flex flex-col gap-4">
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
        <Button onClick={openAddStudent}>
          <Plus />
          Add Student
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(student) => student.id}
        renderRowDetail={(student) => (
          <StudentRowDetail student={student} branding={branding} />
        )}
        emptyMessage={
          students.length === 0 ? (
            <EmptyState
              title="No students yet"
              description="Add your first student to start tracking attendance, fees, and results."
              action={
                <Button size="sm" onClick={openAddStudent}>
                  <Plus />
                  Add Student
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No students match your search"
              description="Try a different name, or clear the class filter."
            />
          )
        }
      />

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
    </div>
  );
}
