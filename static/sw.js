const cacheName = 'scrollytellers';

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.open(cacheName).then((cache) => {
			if (!event.request.url.startsWith('http')) return;
			// Go to the network first
			return fetch(event.request)
				.then((fetchedResponse) => {
					cache.put(event.request, fetchedResponse.clone());
					return fetchedResponse;
				})
				.catch(() => {
					// If offline retrieve everything from the cache!
					return cache.match(event.request.url);
				});
		})
	);
});
