/* Proxy Table service worker — app shell + card art caching, plus
   push notifications for challenges and nudges. */

const SHELL = "pt-shell-v8";
const ART = "pt-art-v1";
const ART_LIMIT = 900;

const SHELL_FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
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

  if (url.hostname.endsWith("scryfall.io") || url.hostname === "cards.scryfall.io"){
    e.respondWith(
      caches.open(ART).then(async c => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok){ c.put(req, res.clone()); trim(ART, ART_LIMIT); }
        return res;
      }).catch(() => fetch(req))
    );
    return;
  }
  // API calls, Scryfall lookups, and the push endpoint always go live.
  if (url.hostname === "api.scryfall.com" || url.pathname.startsWith("/api/")) return;

  if (url.origin === location.origin){
    e.respondWith(
      fetch(req, {cache:"no-store"}).then(res => {
        if (res.ok){
          const copy = res.clone();
          caches.open(SHELL).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
  }
});

/* ---------- push ---------- */
self.addEventListener("push", e => {
  let data = {};
  try{ data = e.data ? e.data.json() : {}; }catch(err){}
  const title = data.title || "Proxy Table";
  const body = data.body || "";
  const tag = data.tag || "proxytable";
  e.waitUntil(self.registration.showNotification(title, {
    body, tag, renotify: true, icon: "./icon-192.png", badge: "./icon-192.png",
    data: data.data || {}
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const d = e.notification.data || {};
  let url = "./index.html";
  if (d.type === "match" && d.matchId) {
    url = `./index.html?match=${encodeURIComponent(d.matchId)}`;
  } else if (d.type === "challenge" && d.code) {
    url = `./index.html?code=${encodeURIComponent(d.code)}`;
  }
  e.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({type:"window", includeUncontrolled:true});
    for (const c of clientsList){
      if ("focus" in c){ await c.navigate(url); return c.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});

