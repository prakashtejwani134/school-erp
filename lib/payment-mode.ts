import type { PaymentMode } from "@prisma/client";

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  BANK_TRANSFER: "Bank Transfer",
};

export const PAYMENT_MODE_BADGE_STYLES: Record<PaymentMode, string> = {
  CASH: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  UPI: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  CHEQUE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  BANK_TRANSFER: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};
