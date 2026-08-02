"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

// Command palettes (components/command-palette.tsx, app/parent/_components/
// parent-command-palette.tsx) each own their `open` state privately and have
// no props to control it externally — this event is the simplest way for a
// header button to open one without lifting that state up into every header.
export const OPEN_COMMAND_PALETTE_EVENT = "open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
}

/**
 * Visible tap target for the command palette — phones don't have Cmd+K.
 * Shows just the search icon on narrow screens; the "Search" label and
 * ⌘K hint appear once there's room.
 */
export function CommandPaletteTrigger() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-11 gap-2 text-muted-foreground md:h-8"
      onClick={openCommandPalette}
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        ⌘K
      </kbd>
    </Button>
  );
}
