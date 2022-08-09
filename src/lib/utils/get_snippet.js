export default function get_snippet(embed_url, script_url) {
    const iframed_embed_url = new URL(embed_url)
    iframed_embed_url.searchParams.set('iframe', 'true')
    const id = Math.random().toString(32).slice(2);

    return `<iframe frameborder="0" style="width:100%;height:400px;" src="${iframed_embed_url.href}" id="${id}" /></iframe>\n<script src="${script_url}" data-hydrate-id="${id}"></script>`
}