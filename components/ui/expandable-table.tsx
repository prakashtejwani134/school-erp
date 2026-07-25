"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { TableCell, TableRow } from "@/components/ui/table";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Animated detail row shown beneath an expandable table row. Render it
 * unconditionally after the summary row (inside the same `<tbody>`) and
 * toggle `open` — height/opacity animate on both expand and collapse.
 */
export function ExpandableDetailRow({
  open,
  colSpan,
  children,
}: {
  open: boolean;
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className="p-0">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div className="bg-muted/30 px-6 py-4">{children}</div>
            </motion.div>
          </TableCell>
        </TableRow>
      ) : null}
    </AnimatePresence>
  );
}
