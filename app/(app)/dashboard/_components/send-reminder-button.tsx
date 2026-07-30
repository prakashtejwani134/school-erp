"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { sendBulkFeeReminders } from "../actions";

export function SendReminderButton({
  highRiskDefaulterCount,
}: {
  highRiskDefaulterCount: number;
}) {
  const [isPending, startTransition] = React.useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const { sentCount, targetedCount } = await sendBulkFeeReminders();
        if (targetedCount === 0) {
          toast.success("No high-risk defaulters right now — nothing to send.");
          return;
        }
        toast.success(
          `WhatsApp reminders sent to ${sentCount} of ${targetedCount} high-risk families.`,
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to send reminders.");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending || highRiskDefaulterCount === 0}
      onClick={handleClick}
    >
      <MessageCircle />
      {isPending
        ? "Sending..."
        : `Send Fee Reminders (WhatsApp)${highRiskDefaulterCount > 0 ? ` · ${highRiskDefaulterCount}` : ""}`}
    </Button>
  );
}
