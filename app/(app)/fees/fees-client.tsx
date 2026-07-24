"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageFadeIn } from "@/components/motion/fade-in";

import { CollectFeeDialog } from "./collect-fee-dialog";
import { PendingDuesTable } from "./pending-dues-table";
import { ReceiptHistoryTable } from "./receipt-history-table";
import type { PendingDueRow, ReceiptRow, StudentOption } from "./types";

export function FeesClient({
  pendingDues,
  receipts,
  students,
  currentUserName,
}: {
  pendingDues: PendingDueRow[];
  receipts: ReceiptRow[];
  students: StudentOption[];
  currentUserName: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogKey, setDialogKey] = React.useState(0);
  const [preselect, setPreselect] = React.useState<{
    studentId?: string;
    feeDueId?: string;
  }>({});

  function openDialog(pre?: { studentId?: string; feeDueId?: string }) {
    setPreselect(pre ?? {});
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function handleCollected(receiptId: string) {
    router.refresh();
    window.open(`/receipts/${receiptId}`, "_blank", "noopener,noreferrer");
  }

  return (
    <PageFadeIn className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => openDialog()}>
          <Plus />
          Collect Fee
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Dues
            {pendingDues.length > 0 ? ` (${pendingDues.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="history">Receipt History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <PendingDuesTable
              dues={pendingDues}
              onCollect={(due) =>
                openDialog({ studentId: due.studentId, feeDueId: due.id })
              }
            />
          </motion.div>
        </TabsContent>
        <TabsContent value="history">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ReceiptHistoryTable receipts={receipts} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <CollectFeeDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        students={students}
        defaultCollectedBy={currentUserName}
        initialStudentId={preselect.studentId}
        initialFeeDueId={preselect.feeDueId}
        onCollected={handleCollected}
      />
    </PageFadeIn>
  );
}
