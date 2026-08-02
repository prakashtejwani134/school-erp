import { ImageResponse } from "next/og";

// Lucide's GraduationCap path data (ISC), already used elsewhere in this
// app (Academics/Classes nav icons) — reused here rather than introducing
// a new mark, so the app icon reads as the same brand at every size.
const GRADUATION_CAP_PATHS = [
  "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
  "M22 10v6",
  "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
];

/** Renders the app icon (--primary teal square, white GraduationCap mark) at the given size. Shared by app/icon.tsx and the manifest's icon-192/icon-512 routes so every size stays visually identical. */
export function renderPwaIcon(size: number) {
  const glyphSize = Math.round(size * 0.55);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E7C7B",
          borderRadius: Math.round(size * 0.2),
        }}
      >
        <svg
          width={glyphSize}
          height={glyphSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FAFAF8"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {GRADUATION_CAP_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
