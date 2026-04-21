> ⚠️ This is the codebase for ScrollyTeller. To learn how to **use** ScrollyTeller head to: [https://digitalprojects.davidson.edu/scrollytellerdh/](https://digitalprojects.davidson.edu/scrollytellerdh/)

## About

ScrollyTeller turns a Google Doc into a scroll-driven web page. An academic writes their piece in Google Docs (following a template), publishes the doc to the web, and pastes the published URL into the ScrollyTeller site — the site fetches the doc's published HTML, parses it into annotations + slides, and renders a scrolly story.

The app is built with [Svelte](https://svelte.dev) and [SvelteKit](https://kit.svelte.dev), and compiles to a fully static site. All doc fetching and parsing happens **client-side** in the browser — there is no server backend for the app itself. The only server-side component is a small Cloudflare Worker used as an image proxy (see below).

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte            # landing page: paste a doc URL, get an embed URL
│   └── v1/embed/+page.svelte   # the scrolly renderer (takes ?id=<google-doc-url>)
├── lib/
│   ├── index.svelte            # top-level scrolly component — orchestrates download + render
│   ├── components/
│   │   ├── Slides.svelte       # scrolly layout + IntersectionObserver that drives slide changes
│   │   ├── Slide.svelte        # renders one slide (image / video / iframe / html / text)
│   │   ├── TitleSlide.svelte   # title card at the top
│   │   ├── ShareCard.svelte    # compact preview used when embedded in an iframe
│   │   └── Html.svelte, Loading.svelte, Message.svelte
│   └── utils/
│       ├── download_doc.js     # fetch published Google Doc, pick a parser
│       ├── parse_doc.js        # modern parser (key/value paragraphs)
│       ├── parse_doc_legacy.js # legacy ArchieML parser
│       ├── doc_to_props.js     # resolve slide URLs to {type, value} (image/video/iframe/text)
│       ├── image_proxy.js      # rewrites image URLs to go through the Cloudflare Worker
│       └── get_snippet.js      # builds the embed HTML snippet shown on the landing page
worker/
└── image-proxy.js              # Cloudflare Worker: proxies Google-hosted images past CORP
```

## Data Flow

1. User visits `/v1/embed?id=<google-doc-url>`.
2. `lib/index.svelte` calls `download_doc(id)` on mount.
3. `download_doc` fetches `https://docs.google.com/document/d/<id>/pub` (Google's "publish to web" HTML) with `cache: 'no-store'`.
4. The HTML is fed to the legacy [ArchieML](http://archieml.org) parser first. If that returns a doc with `.slides`, it wins. Otherwise the modern parser runs. This lets ScrollyTeller support two doc formats:
    - **Modern format**: paragraphs labeled with keys like `title`, `cover`, `slide`, `slide-caption`, `annotation`, separated by horizontal rules (`<hr>`). `parse_doc.js` walks the DOM and groups them into slide objects.
    - **Legacy format**: ArchieML syntax (`[.slides]` blocks). `parse_doc_legacy.js` strips comments/bookmarks, joins paragraph text, and feeds it to the ArchieML library.
5. `doc_to_props(doc)` walks each slide and resolves the `slide` field to a `{type, value}` pair. It matches the value against a series of regexes for YouTube, Vimeo, TikTok, Google Drive, and raw image/video URLs; anything else falls back to `text`. Type inference for ambiguous URLs uses a hidden `<img>`/`<video>` element to probe whether the URL loads.
6. The resolved props are passed to `<Slides>`, which lays out annotations on one side and a sticky slide column on the other. An `IntersectionObserver` updates the current slide as the reader scrolls through annotations.
7. `<Slide>` renders the active slide based on its type — `<img>`, `<video>`, `<iframe>`, raw HTML, or text.

## Local Development

Requires NodeJS 18+ (install via [nvm](https://github.com/nvm-sh/nvm) if needed).

```sh
npm i
npm run dev
```

The dev server runs at http://localhost:5173.

## Deployment

The site is served from a Davidson/inkandbolts FTP server at [https://digitalprojects.davidson.edu/scrollytellerdh/](https://digitalprojects.davidson.edu/scrollytellerdh/). There are two deploy paths, described below; **use the local script as the primary path** until the CI issue is resolved.

### Local deploy (current primary path)

```sh
brew install lftp       # one-time
cp .env.example .env    # if .env is missing — then fill in credentials
./deploy-site.sh
```

`deploy-site.sh` reads FTP credentials from a gitignored `.env` at the repo root, builds the site with `npm run build`, and syncs `build/` to the server over explicit FTPS using `lftp mirror --reverse --delete`. Credentials are managed separately from the code and never committed.

### CI deploy (currently blocked)

A [GitHub Action](./.github/workflows/main.yml) exists that was designed to deploy on every push to `main`, using `FTP_USERNAME`/`FTP_PASSWORD` repository secrets. As of April 2026 it fails: the FTP server's firewall blocks connections from GitHub Actions runner IPs on both port 21 (FTPS) and port 22 (SFTP), while residential IPs are allowed through. Until inkandbolts whitelists GitHub's IP ranges — or the site moves to a git-connected static host — every CI run fails at the FTP step after a ~30-second timeout.

## Image Proxy (Cloudflare Worker)

Images embedded inside a published Google Doc are served from `docs.google.com/docs-images-rt/...` with a `Cross-Origin-Resource-Policy` header that blocks cross-origin `<img>` loads. Because the browser can't override that header and the ScrollyTeller site is served from a different origin than Google, those images fail to load.

The workaround: a tiny Cloudflare Worker at [`worker/image-proxy.js`](./worker/image-proxy.js) re-fetches the image bytes server-side and returns them to the browser without the CORP header. The client rewrites image URLs to go through the Worker via [`src/lib/utils/image_proxy.js`](./src/lib/utils/image_proxy.js) — the rewrite happens inside `parse_doc.js` as `<img>` tags are extracted from the doc HTML.

**Hosts allowlisted by the Worker:** `docs.google.com`, `*.googleusercontent.com`, `drive.google.com`. Anything else returns `403`, preventing the Worker from being abused as an open proxy.

**Caching:** responses are cached for 30 days in both the Cloudflare edge cache (`caches.default`) and the browser cache (`Cache-Control: public, max-age=2592000, immutable`). A returning viewer who has already loaded an image will not generate a Worker invocation for it, which is the main defense against the free tier's 100k-request/day limit.

### Deploying the Worker

First-time setup (requires a free [Cloudflare account](https://dash.cloudflare.com/sign-up), no credit card):

```sh
npx wrangler@latest login   # one-time browser OAuth
./deploy.sh                 # uploads worker/image-proxy.js
```

The first deploy prints a URL like `https://scrollyteller-image-proxy.<your-subdomain>.workers.dev`. Paste that URL into the `IMAGE_PROXY` constant in `src/lib/utils/image_proxy.js` and commit.

Subsequent deploys: just `./deploy.sh`. No client change is needed unless the URL changes.

### Quota Notes

Workers free tier allows 100,000 requests/day. A request is counted when the Worker is invoked, regardless of whether it serves from cache — so the browser cache (not the Worker cache) is what actually protects the quota. If ScrollyTeller traffic ever approaches the limit:

- Set a usage alert in the Cloudflare dashboard under Notifications → "Usage Based Billing".
- Move the Worker behind a custom domain so edge-cached responses bypass the Worker entirely.

## Local Dev Examples

http://localhost:5173/v1/embed?id=https://docs.google.com/document/d/e/2PACX-1vRqniFiiapp4jF7Xp69sF5E3nsKqFC-rT0GDIjvTNIDWYJVpsRBCLQjc7vsj-_EHHNGGUx09uBqIorR/pub

http://localhost:5173/v1/embed?id=https://docs.google.com/document/d/1TavVvjGEsgbP22xQ0elc_6_fxHIxjqyLXZhzEE3UA2k

http://localhost:5173/v1/embed?id=https://docs.google.com/document/d/e/2PACX-1vSko0RPSchuL7b3NhZZ9PrEeht0ySxYD23zoXw_gAf4thBDQ1DoTZ1q_tZ4hloXrAOp0X3H--QVVyUn/pub
