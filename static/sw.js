// const cacheName = 'scrollytellers';

// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		caches.open(cacheName).then(async (cache) => {
// 			if (!event.request.url.startsWith('http')) return;

// 			// if we're pulling images from the gdoc, cache them so google doesn't block us
// 			if (event.request.url.startsWith('https://lh3.googleusercontent.com/d/')) {
// 				const cachedImaged = await cache.match(event.request.url);
// 				if (cachedImaged) {
// 					return 	cachedImaged;
// 				}
// 			}
			
// 			// Go to the network first
// 			return fetch(event.request)
// 				.then((fetchedResponse) => {
// 					// cache response if it's valid
// 					if (fetchedResponse.status < 400) cache.put(event.request, fetchedResponse.clone());
// 					return fetchedResponse;
// 				})
// 				.catch(() => {
// 					// If offline try to retrieve everything from the cache!
// 					return cache.match(event.request.url);
// 				});
// 		})
// 	);
// });
