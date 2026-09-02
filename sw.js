/**
 * Coaching AI — Offline Sideline Service Worker
 * Ensures plays, drills, rosters, and play counters load instantly offline.
 */
const CACHE_NAME = "coaching-ai-v20260902";
const ASSETS_TO_CACHE = [
  "./",
  "index.html",
  "playbook.html",
  "drills.html",
  "app.html",
  "notes.html",
  "tracker.html",
  "roster.html",
  "css/styles.css",
  "js/gate.js",
  "js/app.js",
  "js/sim.js",
  "js/half-drill.js",
  "js/plays-data.js",
  "js/roster.js",
  "js/tracker.js",
  "js/engine/team-manager.js",
  "js/engine/game-tracker.js",
  "js/engine/lineup-manager.js",
  "js/sports/sport-registry.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("index.html");
        }
      });
    })
  );
});
