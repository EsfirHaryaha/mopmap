const CACHE_NAME = "mopmap-v1";

// Install: skip waiting immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: claim all clients immediately so the new SW takes over
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy — always try network, fall back to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET and chrome-extension requests
  if (event.request.method !== "GET") return;
  if (event.request.url.startsWith("chrome-extension://")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline fallback
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
