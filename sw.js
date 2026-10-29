/*
 * Wind VBC — offline helper (service worker)
 *
 * What it does:
 * - Pages and tournament data: always tries the internet first, so families
 *   see your latest changes. If the gym signal is weak (no answer in 3 seconds)
 *   or there's no signal, it shows the last copy saved on the phone instead.
 * - Icons and fonts: served from the phone, refreshed in the background.
 * - Forms (registration, contact, RSVP) are never touched.
 *
 * When you add a new app page, add it to APP_PAGES and bump VERSION.
 */
const VERSION = "wind-v1";
const APP_PAGES = [
  "/team.html",
  "/calendar.html",
  "/practices.html",
  "/tournaments.html",
  "/index.html",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
];
const SLOW_NETWORK_MS = 3000;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => Promise.all(APP_PAGES.map(p => cache.add(new Request(p, { cache: "reload" })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return; // forms and anything that sends data go straight through
  const url = new URL(req.url);

  const isPage = req.mode === "navigate" || (url.origin === location.origin && url.pathname.endsWith(".html"));
  const isAesData = url.hostname.endsWith(".workers.dev");
  const isStatic = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" ||
                   (url.origin === location.origin && /\.(png|svg|css|js|webmanifest|woff2?)$/.test(url.pathname));

  if (isPage) event.respondWith(networkFirst(req, { ignoreSearch: true, fallbackPage: true }));
  // AES answers "not found" until a tournament's schedule is published; save that too,
  // so offline the page still knows to show registration instead of an error.
  else if (isAesData) event.respondWith(networkFirst(req, { keep: res => res.ok || res.status === 404 }));
  else if (isStatic) event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(req, { ignoreSearch = false, fallbackPage = false, keep = res => res.ok }) {
  const cache = await caches.open(VERSION);
  const network = fetch(req).then(res => {
    if (res && keep(res)) cache.put(req, res.clone()).catch(() => {});
    return res;
  });
  const cached = await cache.match(req, { ignoreSearch });
  const offline = async () => cached || (fallbackPage && await cache.match("/team.html")) || Response.error();

  if (!cached) return network.catch(offline);
  const slow = new Promise(resolve => setTimeout(() => resolve(cached), SLOW_NETWORK_MS));
  return Promise.race([network.catch(offline), slow]);
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(req);
  const network = fetch(req).then(res => {
    if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => cached || Response.error());
  return cached || network;
}
