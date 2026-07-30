import "server-only";
import type { PaymentMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/currency";
import { formatDisplayDate, parseDateParam, todayParam } from "@/lib/date";
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

/**
 * Mock WhatsApp delivery of the Director's daily digest — today's fee
 * collection (with payment-mode split), any concessions granted today, and
 * today's school-wide attendance rate. Same shape/approach as
 * `sendWhatsAppReceipt`/`sendWhatsAppFeeReminder` above: builds the payload
 * and logs it instead of sending it. Returns `false` (instead of throwing)
 * when the school has no Director with a phone number on file, so the
 * caller can show a friendly message instead of a stack trace.
 */
export async function sendWhatsAppDirectorDigest(
  schoolId: string,
): Promise<boolean> {
  const directorMembership = await prisma.userSchool.findFirst({
    where: { schoolId, role: "DIRECTOR" },
    include: { user: true },
  });
  const phone = directorMembership?.user.phone?.replace(/\D/g, "");
  if (!phone) return false;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setDate(startOfNextDay.getDate() + 1);
  const today = parseDateParam(todayParam());

  const [todayReceipts, concessionsToday, todayAttendance] = await Promise.all([
    prisma.feeReceipt.findMany({
      where: { schoolId, createdAt: { gte: startOfDay, lt: startOfNextDay } },
      select: { paidAmount: true, paymentMode: true },
    }),
    prisma.student.findMany({
      where: {
        schoolId,
        isDiscounted: true,
        concessionGrantedAt: { gte: startOfDay, lt: startOfNextDay },
      },
      select: {
        firstName: true,
        lastName: true,
        concessionReason: true,
        concessionApprover: { select: { name: true } },
      },
    }),
    prisma.attendance.findMany({
      where: { schoolId, date: today },
      select: { status: true },
    }),
  ]);

  const totalCollected = todayReceipts.reduce((sum, r) => sum + r.paidAmount, 0);

  const byModeMap = new Map<PaymentMode, { amount: number; count: number }>();
  for (const receipt of todayReceipts) {
    const entry = byModeMap.get(receipt.paymentMode) ?? { amount: 0, count: 0 };
    entry.amount += receipt.paidAmount;
    entry.count += 1;
    byModeMap.set(receipt.paymentMode, entry);
  }
  const modeBreakdownText =
    [...byModeMap.entries()]
      .map(
        ([mode, { amount, count }]) =>
          `${PAYMENT_MODE_LABELS[mode]}: ${formatINR(amount)} (${count})`,
      )
      .join(", ") || "No collections yet today";

  const concessionsText =
    concessionsToday
      .map(
        (s) =>
          `${s.firstName} ${s.lastName} — ${s.concessionReason ?? "no reason on file"} (approved by ${s.concessionApprover?.name ?? "unknown"})`,
      )
      .join("; ") || "None today";

  const presentCount = todayAttendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : null;

  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: "director_daily_digest",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: formatDisplayDate(new Date()) },
            { type: "text", text: formatINR(totalCollected) },
            { type: "text", text: modeBreakdownText },
            { type: "text", text: concessionsText },
            {
              type: "text",
              text: attendanceRate === null ? "No attendance marked yet" : `${attendanceRate}%`,
            },
          ],
        },
      ],
    },
  };

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[WhatsApp mock] sendWhatsAppDirectorDigest — would POST to Meta WhatsApp Business Cloud API:",
      JSON.stringify(payload, null, 2),
    );
  }

  return true;
}
