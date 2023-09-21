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
	try {
		const res =	fetch(`https://www.tiktok.com/oembed?url=${src}`)
		const json = res.json();
		console.log(json);
		return 'hello'
	} catch {
		
	}
} 

async function guess_type(slide) {
	try {
		const type = await Promise.any([is_image(slide), is_video(slide)]);
		return type;
	} catch (e) {
		console.log(e);
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

function fix_bad_slides(text) {
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
			return `<blockquote class=\"tiktok-embed\" cite=\"https://www.tiktok.com/@scout2015/video/6718335390845095173\" data-video-id=\"6718335390845095173\" data-embed-from=\"oembed\" style=\"max-width: 605px;min-width: 325px;\" > <section> <a target=\"_blank\" title=\"@scout2015\" href=\"https://www.tiktok.com/@scout2015?refer=embed\">@scout2015</a> <p>Scramble up ur name & I’ll try to guess it😍❤️ <a title=\"foryoupage\" target=\"_blank\" href=\"https://www.tiktok.com/tag/foryoupage?refer=embed\">#foryoupage</a> <a title=\"petsoftiktok\" target=\"_blank\" href=\"https://www.tiktok.com/tag/petsoftiktok?refer=embed\">#petsoftiktok</a> <a title=\"aesthetic\" target=\"_blank\" href=\"https://www.tiktok.com/tag/aesthetic?refer=embed\">#aesthetic</a></p> <a target=\"_blank\" title=\"♬ original sound - 𝐇𝐚𝐰𝐚𝐢𝐢𓆉\" href=\"https://www.tiktok.com/music/original-sound-6689804660171082501?refer=embed\">♬ original sound - 𝐇𝐚𝐰𝐚𝐢𝐢𓆉</a> </section> </blockquote> <script async src=\"https://www.tiktok.com/embed.js\"></script>`
		}

		return text;
	} catch (e) {
		console.error(e);
		return text;
	}
}

export default async function transform_data(doc) {
	let slides = doc?.slides || doc?.Slides || [];

	slides = slides.map(async (s) => {
		let { annotation, caption, 'alt-text': alt_text, slide, type } = clean_slide(s);

		slide = await fix_bad_slides(slide);
		type = derive_type(type, slide);
		if (!type) type = guess_type(slide);

		return { annotation, slide, type, caption, alt_text };
	});

	slides = await Promise.all(slides);
	slides = slides.filter(({ annotation }) => annotation);

	if (!slides.length) {
		throw new Error('No slides found. Make sure you followed the template.');
	}

	let title = doc?.title || '';
	let credit = doc?.credit || '';
	let cover = doc?.cover || '';

	return { title, credit, cover, slides };
}
