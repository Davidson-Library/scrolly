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
	return new Promise((resolve) => {
		const node = document.createElement('img');
		node.fetchPriority = 'high';
		node.src = src;

		node.onload = (e) => {
			node.remove();
			resolve(true);
		};

		node.onerror = () => {
			node.remove();
			resolve(false)
		};
	});
}

function is_video(src) {
	return new Promise((resolve) => {
		const node = document.createElement('video');
		node.src = src;

		function handleSuccess() {
			node.remove();
			resolve(true);
		}

		function handleError() {
			resolve(false);
		}

		node.onloadedmetadata = handleSuccess;
		node.onerror = handleError;
	});
}

async function get_tiktok_embed(text) {
	const url = `https://www.tiktok.com/oembed?url=${text}`;
	let html = localStorage.getItem(url);

	// use local storage so we aren't pounding the tiktok api.
	if (!html) {
		const res = await fetch(`https://www.tiktok.com/oembed?url=${text}`);
		const json = await res.json();
		html = json.html;
		localStorage.setItem(url, html);
	}

	return html;
}

function get_youtube_embed(slide) {
	const [, , fileId] = slide.match(YOUTUBE_LINK);
	let url = `https://www.youtube.com/embed/${fileId}`;
	const start = new URL(slide).searchParams.get('t');
	if (start) url += `?start=${start}`;
	return `<iframe src="${url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

function get_vimeo_embed(slide) {
	const [, fileId] = slide.match(VIMEO_LINK);
	return `<iframe src="https://player.vimeo.com/video/${fileId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
}

function get_google_media(slide) {
	const [, fileId] = slide.match(GDRIVE_LINK);
	return `https://drive.google.com/uc?id=${fileId}`;
}

async function guess_type(slide) {
		let type = window.localStorage.getItem(slide);
		
		if (!type) {
			if ((await is_image(slide))) type = 'image';
			else if ((await is_video(slide))) type = 'video';
			
			if (type) window.localStorage.setItem(slide, type);
		}

		return type;
}

function remove_smart_quotes(blob = '') {
	return blob
		.replace(/[\u2018\u2019]/g, "'") // smart single quotes
		.replace(/[\u201C\u201D]/g, '"'); // smart double quotes
}

function clean_slide(obj) {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => {
			key = key.toLowerCase().trim();
			value = (value || '').trim();
			value = remove_smart_quotes(value);
			return [key, value];
		})
	);
}

async function resolve_slide(type, slide) {
	if (type) {
		return {
			type,
			value: slide
		};
	}

	if (IS_IMAGE.test(slide)) {
		return {
			type: 'image',
			value: slide
		};
	}

	if (IS_VIDEO.test(slide)) {
		return {
			type: 'video',
			value: slide
		};
	}

	if (YOUTUBE_LINK.test(slide)) {
		return {
			type: 'iframe',
			value: get_youtube_embed(slide)
		};
	}

	if (VIMEO_LINK.test(slide)) {
		return {
			type: 'iframe',
			value: get_vimeo_embed(slide)
		};
	}

	if (TIKTOK_LINK.test(slide)) {
		return {
			type: 'html',
			value: await get_tiktok_embed(slide)
		};
	}

	if (GDRIVE_LINK.test(slide)) {
		const value = get_google_media(slide);
		const type = (await guess_type(value)) || 'text';

		return {
			type: type,
			value
		};
	}

	if (is_url(slide)) {
		const type = await guess_type(slide);

		if (type) {
			return {
				type,
				value: slide
			};
		}
	}

	return {
		type: 'text',
		value: slide
	};
}

export default async function transform_data(doc) {
	const slides = (doc?.slides || doc?.Slides || [])
		.map((s) => {
			const { annotation, caption, 'alt-text': alt_text, slide, type } = clean_slide(s);
			return { slide: resolve_slide(type, slide), annotation, caption, alt_text };
		})
		.filter(({ annotation }) => annotation);

	if (!slides.length) {
		throw new Error('No slides found. Make sure you followed the template.');
	}

	let title = doc?.title || '';
	let credit = doc?.credit || '';
	let cover = doc?.cover || '';

	return { title, credit, cover, slides };
}
