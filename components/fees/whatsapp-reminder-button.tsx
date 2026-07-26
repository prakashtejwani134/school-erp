"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildReminderMessage({
  studentName,
  feeTitle,
  dueAmount,
  dueDate,
  schoolName,
}: {
  studentName: string;
  feeTitle: string;
  dueAmount: number;
  dueDate: string;
  schoolName: string;
}): string {
  return [
    "Dear Parent,",
    "",
    `This is a reminder that a fee payment is due for ${studentName}.`,
    "",
    `Fee: ${feeTitle}`,
    `Amount Due: ${formatINR(dueAmount)}`,
    `Due Date: ${dueDate}`,
    "",
    "Please contact the school office to complete the payment at your earliest convenience.",
    "",
    "Regards,",
    schoolName,
  ].join("\n");
}

/** Opens WhatsApp with a pre-filled fee reminder for this due — no online payment flow exists, so no payment link is included. */
export function WhatsAppReminderButton({
  parentPhone,
  studentName,
  feeTitle,
  dueAmount,
  dueDate,
  schoolName,
}: {
  parentPhone: string;
  studentName: string;
  feeTitle: string;
  dueAmount: number;
  dueDate: string;
  schoolName: string;
}) {
  const phone = normalizePhone(parentPhone);
  const message = buildReminderMessage({
    studentName,
    feeTitle,
    dueAmount,
    dueDate,
    schoolName,
  });
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!phone}
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
    >
      <MessageCircle />
      <span className="sr-only">Send WhatsApp reminder</span>
    </Button>
  );
}
