export type ClassOption = {
  id: string;
  name: string;
  section: string;
};

export type SubjectOption = {
  id: string;
  name: string;
};

export type ExamRow = {
  id: string;
  name: string;
  examDate: string;
  classId: string;
  className: string;
};

export type MarkEntryRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  marksObtained: number | null;
  maxMarks: number;
};
