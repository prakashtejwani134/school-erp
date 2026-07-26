"use client";

import * as React from "react";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { switchActiveSchool } from "@/lib/school-actions";

// `redirect()` inside the Server Action throws a special tagged error to
// unwind to the router on success — it must be allowed to propagate, not
// swallowed as a failure. `next/navigation`'s `isRedirectError` isn't
// exported from this version's public entry point, so this checks the same
// `digest` shape it relies on internally.
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

export type SchoolOption = { id: string; name: string };

export function SchoolSwitcher({
  schools,
  activeSchoolId,
}: {
  schools: SchoolOption[];
  activeSchoolId: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const active = schools.find((s) => s.id === activeSchoolId) ?? schools[0];

  const brand = (
    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <Building2 className="size-4" />
    </div>
  );

  // Only one school on this account — show it plainly, no switcher affordance.
  if (schools.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        {brand}
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-semibold">{active?.name ?? "School"}</span>
          <span className="text-xs text-muted-foreground">ERP Console</span>
        </div>
      </div>
    );
  }

  function handleSelect(schoolId: string) {
    if (schoolId === activeSchoolId || isPending) return;
    startTransition(async () => {
      try {
        await switchActiveSchool(schoolId);
      } catch (error) {
        if (isRedirectError(error)) throw error;
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to switch schools. Please try again.",
        );
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton size="lg" disabled={isPending}>
            {brand}
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">{active?.name ?? "School"}</span>
              <span className="text-xs text-muted-foreground">
                {isPending ? "Switching..." : "ERP Console"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch school</DropdownMenuLabel>
        {schools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => handleSelect(school.id)}
          >
            {school.name}
            {school.id === activeSchoolId ? (
              <Check className="ml-auto size-4" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
