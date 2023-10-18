export const IS_IMAGE = /^\S+\.gif|jpe?g|tiff?|png|webp|bmp$/is;
export const IS_VIDEO = /^\S+\.gif|jpe?g|tiff?|png|webp|bmp$/is;
export const GDRIVE_LINK = /^https:\/\/drive\.google\.com\/file\/d\/([-\w]{25,}(?!.*[-\w]{25,}))/is;
export const YOUTUBE_LINK = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/is;
export const VIMEO_LINK = /^.*vimeo\.com\/([^#\&\?]*).*/is;
export const TIKTOK_LINK = /^.*tiktok\.com\/(.*)\/video\/.*/is;

function is_url(url) {
	try {
		new URL(url).toString();
		return true;
	} catch {
		return false;
	}
}

async function is_image(src) {
	return new Promise((resolve, reject) => {
		const node = document.createElement('img');
		node.fetchPriority = 'high';
		node.src = src;

		node.onload = () => {
			node.remove();
			resolve('image');
		};

		node.onerror = (e) => {
			node.remove();
			reject(`${src} is not an image.`);
		};
	});
}

function is_video(src) {
	return new Promise((resolve, reject) => {
		const node = document.createElement('video');
		node.src = src;

		function handleSuccess() {
			node.remove();
			resolve('video');
		}

		function handleError() {
			reject(`${src} is not a video.`);
		}

		node.onloadedmetadata = handleSuccess;
		node.onerror = handleError;
	});
}

async function get_tiktok_embed(src) {
	const url = `https://www.tiktok.com/oembed?url=${src}`
	let html = localStorage.getItem(url);

	// use local storage so we aren't pounding the tiktok api.
	if (!html) {
		const res =	await fetch(`https://www.tiktok.com/oembed?url=${src}`)
		const json = await res.json();
		html = json.html;
		localStorage.setItem(url, html);
	}

	return html
} 

async function guess_type(slide) {
	try {
		let type = window.localStorage.getItem(slide);
		
		if (!type) {
		 	type = await Promise.any([is_image(slide), is_video(slide)]);
			window.localStorage.setItem(slide, type)
		}

		return type;
	} catch (e) {
		return 'text';
	}
}

function remove_smart_quotes(blob = '') {
	return blob.replace(/[\u2018\u2019]/g, "'") // smart single quotes
		.replace(/[\u201C\u201D]/g, '"'); // smart double quotes
}

function clean_slide(obj) {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => {
			key = key.toLowerCase().trim()
			value = (value || '').trim();
			value = remove_smart_quotes(value)

			return [key, value]
		})
	);
}

function derive_type(type, slide) {
	if (IS_IMAGE.test(slide)) return 'image';
	if (IS_VIDEO.test(slide)) return 'video';
	if (YOUTUBE_LINK.test(slide)) return 'iframe';
	if (VIMEO_LINK.test(slide)) return 'iframe';
	if (TIKTOK_LINK.test(slide)) return 'html';
	if (type) return type;
	if (!is_url(slide)) return 'text';
	return undefined;
}

async function resolve_slide(text) {
	try {		
		if (GDRIVE_LINK.test(text)) {
			const [, fileId] = text.match(GDRIVE_LINK);
			return `https://drive.google.com/uc?id=${fileId}`;
		}

		if (YOUTUBE_LINK.test(text)) {
			const [, , fileId] = text.match(YOUTUBE_LINK);
			let url = `https://www.youtube.com/embed/${fileId}`
			const start = new URL(text).searchParams.get('t');
			if (start) url += `?start=${start}`;
			return `<iframe src="${url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
		}

		if (VIMEO_LINK.test(text)) {
			const [, fileId] = text.match(VIMEO_LINK);
			return `<iframe src="https://player.vimeo.com/video/${fileId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
		}

		if (TIKTOK_LINK.test(text)) {
			const html = await get_tiktok_embed(text);
			return html;
		}

	} catch (e) {
		console.error(e);
	}

	return text;
}

export default async function transform_data(doc) {
	const slides = (doc?.slides || doc?.Slides || []).map((s) => {
		const { annotation, caption, 'alt-text': alt_text, slide, type } = clean_slide(s);
		
		async function parse_slide() {
			const [t, v] = await Promise.all([
				derive_type(type, slide) ?? guess_type(slide),
				resolve_slide(slide)
			]);

			return { value: v, type: t }
		}

		return { slide: parse_slide(), annotation, caption, alt_text };
	}).filter(({ annotation }) => annotation);

	if (!slides.length) {
		throw new Error('No slides found. Make sure you followed the template.');
	}

	let title = doc?.title || '';
	let credit = doc?.credit || '';
	let cover = doc?.cover || '';

	return { title, credit, cover, slides };
}
