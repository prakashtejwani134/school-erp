import "server-only";

import { prisma } from "@/lib/prisma";
import { formatDisplayDateTime } from "@/lib/date";
import { CIRCULAR_RECENT_WINDOW_DAYS, getUnreadCircularCount } from "../data";

export type CircularRow = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  isNew: boolean;
};

export type CircularsPageData = {
  circulars: CircularRow[];
  unreadCount: number;
};

// Reuses the exact same "unread" definition and recency window the
// attention strip already computes (../data.ts) — no separate read-tracking
// concept exists yet on User/UserSchool, so this doesn't invent one.
export async function getCircularsPageData(schoolId: string): Promise<CircularsPageData> {
  const since = new Date();
  since.setDate(since.getDate() - CIRCULAR_RECENT_WINDOW_DAYS);

  const [circulars, unreadCount] = await Promise.all([
    prisma.circular.findMany({
      where: { schoolId },
      orderBy: { publishedAt: "desc" },
    }),
    getUnreadCircularCount(schoolId),
  ]);

  return {
    unreadCount,
    circulars: circulars.map((c) => ({
      id: c.id,
      title: c.title,
      body: c.body,
      publishedAt: formatDisplayDateTime(c.publishedAt),
      isNew: c.publishedAt >= since,
    })),
  };
}
