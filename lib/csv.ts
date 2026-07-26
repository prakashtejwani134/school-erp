import "server-only";

export type CsvColumn<T> = {
  key: keyof T;
  header: string;
};

/** Escapes a single CSV field per RFC 4180: wraps in quotes if it contains a comma, quote, or newline, doubling any internal quotes. */
function escapeCsvField(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Renders rows to a CSV string (with header row), given an explicit column order and display headers. */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((c) => escapeCsvField(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvField(row[c.key])).join(","),
  );
  return [headerLine, ...lines].join("\r\n");
}
