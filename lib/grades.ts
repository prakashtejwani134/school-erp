export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

/** Ordered high-to-low — first band whose `min` the percentage clears wins. */
const GRADE_BANDS: { min: number; grade: Grade }[] = [
  { min: 90, grade: "A+" },
  { min: 75, grade: "A" },
  { min: 60, grade: "B" },
  { min: 45, grade: "C" },
  { min: 33, grade: "D" },
  { min: 0, grade: "F" },
];

export function computePercentage(marksObtained: number, maxMarks: number): number {
  if (maxMarks <= 0) return 0;
  return Math.round((marksObtained / maxMarks) * 10000) / 100;
}

export function computeGrade(percentage: number): Grade {
  const band = GRADE_BANDS.find((b) => percentage >= b.min);
  return band?.grade ?? "F";
}
