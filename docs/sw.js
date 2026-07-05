/* Psaumes — service worker.
   Stratégie : réseau d'abord (pour que les mises à jour arrivent tout de
   suite), cache en secours (pour que le recueil s'ouvre même hors ligne). */

var VERSION = "psaumes-v1";
var SHELL = [
  "./",
  "index.html",
  "poeme.html",
  "assets/style.css",
  "assets/app.js",
  "assets/data.js",
  "manifest.webmanifest",
  "assets/icon-192.png",
  "assets/icon-512.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(VERSION).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      })
      .catch(function () {
        // hors ligne : ignoreSearch pour que poeme.html?p=3 retrouve poeme.html
        return caches.match(req, { ignoreSearch: true }).then(function (hit) {
          return hit || caches.match("./");
        });
      })
  );
});
