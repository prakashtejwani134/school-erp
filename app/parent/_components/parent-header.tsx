import { ThemeToggle } from "@/components/theme-toggle";

// The parent portal has no sidebar, so this is a slim analog of
// components/site-header.tsx — same h-14/border-b/backdrop-blur treatment,
// minus the sidebar trigger, with the same next-themes toggle.
export function ParentHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <span className="text-sm font-medium">Parent Portal</span>
      <ThemeToggle />
    </header>
  );
}
