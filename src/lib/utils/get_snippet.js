export default function get_snippet(embed_url) {
	return `<iframe frameborder="0" style="display:block;width:100%;min-height:400px;border-radius:8px;max-width:600px;margin:auto;border:1px solid #ccc;" src="${embed_url}" /></iframe>`;
}
