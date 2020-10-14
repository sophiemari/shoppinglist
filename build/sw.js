importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js"
);

if (workbox) {
  workbox.routing.registerRoute(
    new RegExp("https://fonts.(?:googleapis|gstatic).com/(.*)"),
    workbox.strategies.cacheFirst({
      cacheName: "google-fonts",
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 30,
        }),
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  console.log(`Yay! Workbox is loaded 🎉`);
  workbox.precaching.precacheAndRoute([{"revision":"d68790203bb6844a7c035293a2855386","url":"css/app.css"},{"revision":"2efb079eaaec5206cb59907e66ea454c","url":"index.html"},{"revision":"21d64a1d7aa1c6da0a3ed6c332610cc2","url":"js/app.js"},{"revision":"785aeb77f46fe1e3135e4a1e4826b63c","url":"workbox-29ec39d4.js"}]);
  workbox.precaching.precacheAndRoute([]); // URLs to precache injected by workbox build
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}


