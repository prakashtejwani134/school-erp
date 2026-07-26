"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { collectFee } from "./actions";
import type { CollectFeeInput, CollectFeeResult } from "./actions";
import { PendingDuesTable } from "./pending-dues-table";
import { ReceiptHistoryTable } from "./receipt-history-table";
import type {
  PendingDueRow,
  ReceiptRow,
  SchoolBranding,
  StudentOption,
} from "./types";

const AMOUNT_EPSILON = 0.01;

// Not needed for the initial dues/receipts view — only once the user opens
// the collect-fee flow — so it's split into its own chunk instead of
// bundled into the page's initial JS.
const CollectFeeSheet = dynamic(
  () => import("./collect-fee-sheet").then((m) => m.CollectFeeSheet),
  { ssr: false },
);

function applyOptimisticPayment(
  state: PendingDueRow[],
  payload: { feeDueId: string; amount: number },
): PendingDueRow[] {
  return state.flatMap((due) => {
    if (due.id !== payload.feeDueId) return [due];
    const amountPaid = due.amountPaid + payload.amount;
    const remainingAmount = due.totalAmount - amountPaid;
    if (remainingAmount <= AMOUNT_EPSILON) return [];
    return [{ ...due, amountPaid, remainingAmount }];
  });
}

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
  const [, startTransition] = React.useTransition();
  const [optimisticDues, addOptimisticPayment] = React.useOptimistic(
    pendingDues,
    applyOptimisticPayment,
  );

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

  function handleCollect(input: CollectFeeInput): Promise<CollectFeeResult> {
    return new Promise((resolve, reject) => {
      startTransition(async () => {
        addOptimisticPayment({ feeDueId: input.feeDueId, amount: input.amount });
        try {
          resolve(await collectFee(input));
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  function handleCollected(receiptId: string) {
    router.refresh();
    window.open(`/receipts/${receiptId}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          render={<a href="/fees/structures/export" download />}
        >
          <Download />
          Export Fee Structures
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={<a href="/fees/receipts/export" download />}
        >
          <Download />
          Export Receipts
        </Button>
        <Button onClick={() => openDialog()}>
          <Plus />
          Collect Fee
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Dues
            {optimisticDues.length > 0 ? ` (${optimisticDues.length})` : ""}
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
              dues={optimisticDues}
              schoolName={branding.schoolName}
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

      <CollectFeeSheet
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        students={students}
        defaultCollectedBy={currentUserName}
        initialStudentId={preselect.studentId}
        initialFeeDueId={preselect.feeDueId}
        onCollect={handleCollect}
        onCollected={handleCollected}
      />
    </div>
  );
}
