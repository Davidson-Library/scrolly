// Cloudflare Worker: proxies Google-hosted images so they can be embedded
// cross-origin. Google serves these with a Cross-Origin-Resource-Policy
// header that blocks <img> loads on third-party sites; we fetch the bytes
// here and re-emit them without that header.
//
// Deploy:
//   1. Create a Cloudflare account (free).
//   2. Workers & Pages → Create → Start with Hello World
//   3. Paste the contents of this file into the editor, Save & Deploy.
//   4. Copy the *.workers.dev URL and put it in src/lib/utils/image_proxy.js.

const ALLOWED_HOSTS = [
	'docs.google.com',
	'googleusercontent.com',
	'drive.google.com'
];

// 30 days. Published-doc image URLs are unique per upload — if the doc is
// re-published, the URL changes, so a stale entry just becomes orphaned.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;

function isAllowed(hostname) {
	return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith('.' + h));
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const target = url.searchParams.get('u');

		if (!target) {
			return new Response('missing ?u=<url>', { status: 400 });
		}

		let targetUrl;
		try {
			targetUrl = new URL(target);
		} catch {
			return new Response('invalid url', { status: 400 });
		}

		if (targetUrl.protocol !== 'https:' || !isAllowed(targetUrl.hostname)) {
			return new Response('host not allowed', { status: 403 });
		}

		const cache = caches.default;
		const cacheKey = new Request(request.url, { method: 'GET' });
		const cached = await cache.match(cacheKey);
		if (cached) return cached;

		const upstream = await fetch(targetUrl.toString(), {
			cf: { cacheTtl: CACHE_TTL_SECONDS, cacheEverything: true },
			headers: { 'user-agent': 'scrollyteller-image-proxy' }
		});

		const headers = new Headers();
		const contentType = upstream.headers.get('content-type');
		if (contentType) headers.set('content-type', contentType);
		headers.set('cache-control', `public, max-age=${CACHE_TTL_SECONDS}, immutable`);
		headers.set('access-control-allow-origin', '*');

		const response = new Response(upstream.body, {
			status: upstream.status,
			headers
		});

		if (upstream.ok) {
			ctx.waitUntil(cache.put(cacheKey, response.clone()));
		}

		return response;
	}
};
