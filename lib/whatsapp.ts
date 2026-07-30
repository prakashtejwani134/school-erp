import "server-only";

import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/currency";
import { formatDisplayDate } from "@/lib/date";
import { PAYMENT_MODE_LABELS } from "@/lib/payment-mode";

/**
 * Mock WhatsApp delivery for a fee receipt. Builds the exact payload shape
 * the Meta WhatsApp Business Cloud API expects and logs it instead of
 * sending it — swap the console.log for a `fetch` to
 * `https://graph.facebook.com/v.../messages` once WHATSAPP_ACCESS_TOKEN /
 * WHATSAPP_PHONE_NUMBER_ID are available, no other call sites need to change.
 */
export async function sendWhatsAppReceipt(receiptId: string): Promise<void> {
  const receipt = await prisma.feeReceipt.findUnique({
    where: { id: receiptId },
    include: { student: true, feeDue: { include: { feeStructure: true } } },
  });
  if (!receipt) return;

  const phone = receipt.student.parentPhone.replace(/\D/g, "");

  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: "fee_receipt_confirmation",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: `${receipt.student.firstName} ${receipt.student.lastName}`,
            },
            { type: "text", text: receipt.receiptNo },
            { type: "text", text: formatINR(receipt.paidAmount) },
            { type: "text", text: receipt.feeDue.feeStructure.title },
            { type: "text", text: PAYMENT_MODE_LABELS[receipt.paymentMode] },
            { type: "text", text: formatDisplayDate(receipt.createdAt) },
          ],
        },
      ],
    },
  };

  // Full payload (includes the parent's phone number and student name) is
  // only logged outside production, to keep student/parent PII out of
  // production server logs. Swap this block for the real `fetch` call —
  // `payload` above is already shaped for it — and this log goes away
  // entirely.
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[WhatsApp mock] sendWhatsAppReceipt — would POST to Meta WhatsApp Business Cloud API:",
      JSON.stringify(payload, null, 2),
    );
  }
}

/**
 * Mock WhatsApp delivery for a fee-due reminder. Same shape/approach as
 * `sendWhatsAppReceipt` above — logs the payload instead of sending it, so
 * the same swap-in-a-`fetch` note applies here too. Returns `false` (instead
 * of throwing) when the student has no usable phone number, so a bulk
 * caller can count skips without a try/catch per student.
 */
export async function sendWhatsAppFeeReminder(
  studentId: string,
): Promise<boolean> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return false;

  const phone = student.parentPhone.replace(/\D/g, "");
  if (!phone) return false;

  const dues = await prisma.feeDue.findMany({
    where: { studentId, isPaid: false },
    include: { feeStructure: true },
    orderBy: { feeStructure: { dueDate: "asc" } },
  });
  if (dues.length === 0) return false;

  const totalDue = dues.reduce(
    (sum, due) => sum + (due.dueAmount - due.amountPaid),
    0,
  );
  const nextDueDate = dues[0].feeStructure.dueDate;

  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: "fee_payment_reminder",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: `${student.firstName} ${student.lastName}` },
            { type: "text", text: formatINR(totalDue) },
            { type: "text", text: formatDisplayDate(nextDueDate) },
          ],
        },
      ],
    },
  };

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[WhatsApp mock] sendWhatsAppFeeReminder — would POST to Meta WhatsApp Business Cloud API:",
      JSON.stringify(payload, null, 2),
    );
  }

  return true;
}
