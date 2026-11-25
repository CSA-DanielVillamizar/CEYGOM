// Offline mode: what the visitor already opened keeps working without a connection (product pages, data sheets in
// PDF, the quote list), which matters on a site with a weak mobile signal. No third-party code, no push, no
// background sync. Quote requests (POST /api/quote) and anything outside this origin are never touched.
//
// Strategies:
//   pages (navigations)           network first, 4 s timeout, then the cached copy, then /sin-conexion/
//   /_astro/*                     cache first (file names carry a content hash)
//   data sheets, indexes, images  stale while revalidate
// Bump VERSION to drop every cache on the next deploy (v2: new brand, so nobody keeps the old logo or typeface).
const VERSION = "v2";
const PAGES = `ceygom-pages-${VERSION}`;
const ASSETS = `ceygom-assets-${VERSION}`;
const OFFLINE_URL = "/sin-conexion/";
const PRECACHE = [OFFLINE_URL, "/", "/productos/", "/cotizacion/"];
// Filled at build time by scripts/inject-sw-precache.mjs with the hashed fonts, styles and logos under /_astro/.
const PRECACHE_ASSETS = [];
const NETWORK_TIMEOUT_MS = 4000;
const MAX_PAGES = 120;

/** What to do with a request: "skip" (let the browser handle it), or the strategy name. */
function strategyFor(url, request) {
  if (request.method !== "GET") return "skip";
  if (url.origin !== self.location.origin) return "skip";
  if (url.pathname.startsWith("/api/")) return "skip";
  if (request.headers.get("range")) return "skip";
  if (url.pathname === "/sw.js") return "skip";
  if (url.pathname.startsWith("/_astro/")) return "cache-first";
  // A data sheet opened from a link is a navigation too, but it is a file: keep it with the files, not with the pages.
  if (url.pathname.startsWith("/fichas/")) return "stale-while-revalidate";
  if (request.mode === "navigate") return "network-first";
  return "stale-while-revalidate";
}

// Redirected or partial responses cannot be replayed safely for a navigation: do not store them.
const cacheable = (response) => response && response.ok && response.status === 200 && !response.redirected && response.type === "basic";

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT_MS)),
    ]);
    if (cacheable(response)) {
      await cache.put(request, response.clone());
      await trim(PAGES, MAX_PAGES);
    }
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (cacheable(response)) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (cacheable(response)) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return hit || (await refresh) || Response.error();
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([caches.open(PAGES).then((cache) => cache.addAll(PRECACHE)), caches.open(ASSETS).then((cache) => cache.addAll(PRECACHE_ASSETS))]).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n.startsWith("ceygom-") && n !== PAGES && n !== ASSETS).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const strategy = strategyFor(new URL(request.url), request);
  if (strategy === "skip") return;
  event.respondWith(strategy === "network-first" ? networkFirst(request) : strategy === "cache-first" ? cacheFirst(request) : staleWhileRevalidate(request));
});
