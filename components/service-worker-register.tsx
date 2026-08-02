"use client";

import { useEffect } from "react";

/** Registers public/sw.js on mount. Silently no-ops if unsupported (e.g. dev over plain HTTP on a non-localhost host) — this is additive, never load-bearing. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
