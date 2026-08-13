/* Proxy Table service worker.
   Two jobs: keep the app shell available, and cache card art so the
   same deck doesn't re-download 60 images every game. */

const SHELL = "pt-shell-v2";
const ART = "pt-art-v1";
const ART_LIMIT = 900;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== ART).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trim(name, limit){
  const c = await caches.open(name);
  const keys = await c.keys();
  if (keys.length > limit) await Promise.all(keys.slice(0, keys.length - limit).map(k => c.delete(k)));
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Card art: serve from cache first, fill the cache in the background.
  if (url.hostname.endsWith("scryfall.io") || url.hostname === "cards.scryfall.io") {
    e.respondWith(
      caches.open(ART).then(async c => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) { c.put(req, res.clone()); trim(ART, ART_LIMIT); }
        return res;
      }).catch(() => fetch(req))
    );
    return;
  }

  // Card lookups and the signalling server must always go to the network.
  if (url.hostname === "api.scryfall.com" || url.hostname.includes("peerjs")) return;

  // App shell: network first so a re-upload shows up, cache as the fallback.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) caches.open(SHELL).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
  }
});
