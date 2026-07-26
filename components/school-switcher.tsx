"use client";

import * as React from "react";
import { Building2, Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { switchActiveSchool } from "@/lib/school-actions";

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
      await switchActiveSchool(schoolId);
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
