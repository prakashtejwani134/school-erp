// Minimal service worker: cache-first for static, content-hashed assets
// only (Next's /_next/static/* build output, plus the generated app
// icons). Everything else — pages, Server Actions, data — always goes to
// the network untouched. This is what actually makes the app installable
// (Chrome requires a registered service worker with a fetch handler) and
// gives it a slightly faster repeat-load feel; it is deliberately not an
// attempt at offline data sync.
const CACHE_NAME = "school-erp-static-v1";
const STATIC_PATTERNS = [/^\/_next\/static\//, /^\/icon(-192|-512)?$/, /^\/favicon\.ico$/];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname))) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }),
  );
});
