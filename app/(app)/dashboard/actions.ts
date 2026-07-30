"use server";

import { getDefaulterRiskProfiles } from "@/lib/analytics/defaulters";
import { sendWhatsAppDirectorDigest, sendWhatsAppFeeReminder } from "@/lib/whatsapp";
import { requireActiveSchoolContext } from "@/lib/school-context";

export type SendBulkFeeRemindersResult = {
  targetedCount: number;
  sentCount: number;
};

/**
 * Sends a mocked WhatsApp fee reminder to every HIGH-risk defaulter (see
 * `getDefaulterRiskProfiles`). Mirrors the mock-first approach of
 * `sendWhatsAppReceipt`/`sendWhatsAppFeeReminder` — no real Meta API call
 * happens until `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` are wired
 * up, so this is safe to trigger freely in the demo.
 */
export async function sendBulkFeeReminders(): Promise<SendBulkFeeRemindersResult> {
  const { schoolId } = await requireActiveSchoolContext();

  const profiles = await getDefaulterRiskProfiles(schoolId);
  const highRiskStudentIds = [...profiles.values()]
    .filter((profile) => profile.risk === "HIGH")
    .map((profile) => profile.studentId);

  let sentCount = 0;
  for (const studentId of highRiskStudentIds) {
    const sent = await sendWhatsAppFeeReminder(studentId);
    if (sent) sentCount += 1;
  }

  return { targetedCount: highRiskStudentIds.length, sentCount };
}

/**
 * Sends a mocked WhatsApp digest (today's collections, concessions, and
 * attendance rate) to the school's Director. Throws a friendly error
 * instead of a stack trace when no Director with a phone number on file
 * exists for this school.
 */
export async function sendDirectorDailyDigest(): Promise<void> {
  const { schoolId } = await requireActiveSchoolContext();

  const sent = await sendWhatsAppDirectorDigest(schoolId);
  if (!sent) {
    throw new Error(
      "No Director with a phone number on file for this school — can't send the digest.",
    );
  }
}
