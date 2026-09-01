const CACHE_NAME = "inventaris-pwa-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


// INSTALL
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


// ACTIVATE
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (
                        key !== CACHE_NAME
                    ) {

                        return caches.delete(key);

                    }

                })

            );

        })

    );

    self.clients.claim();

});


// FETCH
self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                return (
                    cachedResponse ||
                    fetch(event.request)
                );

            })

            .catch(() => {

                return caches.match(
                    "./index.html"
                );

            })

    );

});