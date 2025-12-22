import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { defaultCache } from "@serwist/next/worker";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: true,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    ignoreURLParametersMatching: [/.*/],
  },
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/~offline").then(
          (cachedResponse) =>
            cachedResponse ||
            new Response(null, {
              status: 500,
              statusText: "Internal Server Error",
            }),
        ),
      ),
    );
  }
});

const urlsToCache = ["/preview", "/editor", "/~offline"] as const;

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all(
      urlsToCache.map((entry) => {
        const request = serwist.handleRequest({
          request: new Request(entry),
          event,
        });
        return request;
      }),
    ),
  );
});
