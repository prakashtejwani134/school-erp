import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSession } from "@/lib/session";

// Optimistic-only: reads the session cookie, no DB call (Next's Proxy
// guidance is explicit that DB-backed checks belong in the page/DAL layer,
// not here — see requireRouteAccess / getActiveSchoolContext for the real
// membership+role check). This only exists to short-circuit the /login <->
// /dashboard bounce before Next has to compile either page's module graph.
export default async function proxy(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard" && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard"],
};
