import archieml from 'archieml';

export function parse_doc_legacy(html) {
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

	const text = [];

	node.querySelectorAll('p').forEach((el) => text.push(el.innerText));

	const aml = text.join('\n');

	return archieml.load(aml);
}
