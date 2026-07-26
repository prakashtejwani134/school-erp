import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "erp_session";

export type SessionPayload = {
  userId: string;
  schoolId: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as SessionPayload).userId === "string" &&
      typeof (parsed as SessionPayload).schoolId === "string"
    ) {
      return parsed as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string,
  schoolId: string,
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify({ userId, schoolId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
