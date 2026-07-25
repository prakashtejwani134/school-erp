"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CollectFeeDialog } from "./collect-fee-dialog";
import { PendingDuesTable } from "./pending-dues-table";
import { ReceiptHistoryTable } from "./receipt-history-table";
import type {
  PendingDueRow,
  ReceiptRow,
  SchoolBranding,
  StudentOption,
} from "./types";

export function FeesClient({
  pendingDues,
  receipts,
  students,
  currentUserName,
  branding,
}: {
  pendingDues: PendingDueRow[];
  receipts: ReceiptRow[];
  students: StudentOption[];
  currentUserName: string;
  branding: SchoolBranding;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  React.useEffect(() => {
    // Syncing dialog-open state to the ?action= query param set by the
    // command palette / other pages — a legitimate external-system sync,
    // not derivable state, so setState-in-effect is intentional here.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (searchParams.get("action") === "collect") {
      openDialog();
      router.replace("/fees", { scroll: false });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleCollected(receiptId: string) {
    router.refresh();
    window.open(`/receipts/${receiptId}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-4">
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
            <ReceiptHistoryTable receipts={receipts} branding={branding} />
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
    </div>
  );
}
