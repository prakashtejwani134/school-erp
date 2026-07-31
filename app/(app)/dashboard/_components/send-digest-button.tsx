"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { sendDirectorDailyDigest } from "../actions";

export function SendDigestButton() {
  const [isPending, startTransition] = React.useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await sendDirectorDailyDigest();
        toast.success("Today's report sent to the Director on WhatsApp.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to send today's report.");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-11 md:h-7"
      disabled={isPending}
      onClick={handleClick}
    >
      <Send />
      {isPending ? "Sending..." : "Send Today's Report"}
    </Button>
  );
}
