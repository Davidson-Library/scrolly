const cacheName = 'scrollytellers';

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.open(cacheName).then((cache) => {
        // Go to the network first
        return fetch(event.request.url).then((fetchedResponse) => {
            cache.put(event.request, fetchedResponse.clone());
            return fetchedResponse;
        }).catch(() => {
            // If offline retrieve everything from the cache!
            return cache.match(event.request.url);
        });
    }));

});