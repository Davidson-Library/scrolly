export function parse_doc(html) {
	// handle white space entities
	html = html.replace(/&nbsp;/g, ' ');
	const node = new DOMParser().parseFromString(html, 'text/html');
	// const node = dom.querySelector("div#contents > div");

	// remove all comments
	node.querySelectorAll('sup').forEach((el) => {
		const a = el.querySelector('a');
		if (a.getAttribute('href')?.startsWith('#cmnt')) {
			el.remove();
		}
	});

	// remove all bookmark links
	node.querySelectorAll('a').forEach((el) => {
		if (!el.getAttribute('href')) el.remove();
	});

	// convert all images to just their urls
	node.querySelectorAll('img').forEach((el) => {
		console.log(el);
		const span = node.createElement('span');
		span.innerHTML = el.getAttribute('src');
		el.replaceWith(span);
	});

	const ctx = [{}];

	const keys = ['title', 'credit', 'cover', 'alt-text', 'caption', 'slide', 'annotation', 'annotation-caption', 'type'];

	let key = null;

	node.querySelectorAll('.doc-content > *').forEach((el) => {
		if (el.nodeName === 'P') {
			const line = el.innerText?.trim();

			if (!line) return;

			const maybekey = line
				?.toLowerCase()
				?.match(/(\w|-)+/g)
				?.join?.('');

			if (keys.includes(maybekey)) {
				key = maybekey;
			} else {
				const idx = ctx.length - 1;

				if (!ctx[idx][key]) ctx[idx][key] = line;
				else ctx[idx][key] += `\n${line}`;
			}
		}

		if (el.nodeName === 'HR') {
			key = null;
			ctx.push({});
		}
	});

	const metadata = ctx.find((c) => c.title || c.credit || c.cover);
	const slides = ctx.filter((c) => c.annotation || c.slide);

	return {
		...metadata,
		slides
	};
}
