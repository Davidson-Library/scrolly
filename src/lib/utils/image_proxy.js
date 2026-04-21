// Replace with your deployed Cloudflare Worker URL (see worker/image-proxy.js).
const IMAGE_PROXY = 'https://scrollyteller-image-proxy.john-michael-murphy.workers.dev';

const PROXIED_HOSTS = ['docs.google.com', 'googleusercontent.com'];

export function proxy_image(url) {
	if (!url) return url;
	try {
		const host = new URL(url).hostname;
		const needsProxy = PROXIED_HOSTS.some((h) => host === h || host.endsWith('.' + h));
		return needsProxy ? `${IMAGE_PROXY}/?u=${encodeURIComponent(url)}` : url;
	} catch {
		return url;
	}
}
