const cachePrefix = "courier-clash:" + self.registration.scope + ":";
const cacheName = cachePrefix + "mws7xg1v";
const indexUrl = new URL("index.html", self.registration.scope).href;
const assets = new Set([
  "index.html",
  "manifest.webmanifest",
  "TemplateData/style.css",
  "TemplateData/asd.webp",
  "TemplateData/courier-clash-logo.png",
  "TemplateData/icons/icon-192.png",
  "TemplateData/icons/icon-512.png",
  "TemplateData/icons/maskable-512.png",
  "Build/" + "Builds.loader.js",
  "Build/" + "Builds.data",
  "Build/" + "Builds.framework.js",
  "Build/" + "Builds.wasm",
].map((path) => new URL(path, self.registration.scope).href));

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...assets].map((url) => new Request(url, { cache: "reload" })));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith(cachePrefix) && name !== cacheName)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("Range")) return;

  const url = new URL(request.url);
  const isStartPage = request.mode === "navigate"
    && (url.origin + url.pathname === self.registration.scope || url.origin + url.pathname === indexUrl);
  const assetUrl = isStartPage ? indexUrl : request.url;
  if (!assets.has(assetUrl)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(assetUrl)) || fetch(request);
  })());
});
