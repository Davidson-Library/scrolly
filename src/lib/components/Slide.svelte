<script>
	import { onMount } from 'svelte';
	import Loading from './Loading.svelte';
	import Html from './Html.svelte';

	export let type;
	export let slide;
	export let alt_text = '';
	export let caption = '';
	export let visible = false;

	onMount(async () => {
		type = await type;
	});
</script>

<figure>
	{#await slide}
		<div aria-label="Loading slide" class="scrolly-slide-message">
			<Loading />
		</div>
	{:then { type, value }}
		{#if !value}
			<div class="scrolly-slide-message">
				<span>no slide</span>
			</div>
		{:else if type === 'image'}
			<img class="scrolly-slide-media" src={value} alt={alt_text} referrerpolicy="no-referrer" />
		{:else if type === 'video' && visible}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video class="scrolly-slide-media" src={value} playsinline controls alt={alt_text} />
		{:else if type === 'iframe' && visible}
			<div class="scrolly-slide-iframe">
				{@html value}
			</div>
		{:else if type === 'html' && visible}
			<Html html={value} />
		{:else if type === 'text'}
			<span class="scrolly-slide-text">
				{@html value}
			</span>
		{:else}
			<div class="scrolly-slide-message">
				<span>Error: The type "{type}" is not supported.</span>
			</div>
		{/if}
		{#if caption}
			<figcaption class="scrolly-slide-caption">
				{@html caption}
			</figcaption>
		{/if}
	{:catch e}
		<div class="scrolly-slide-message">
			<span>${e.stack}</span>
		</div>
	{/await}
</figure>

<style>
	figure {
		all: unset;
		position: relative;
		display: flex;
		height: 100vh;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		box-sizing: border-box;
		padding: 20px;
	}

	figcaption {
		display: block;
	}

	/* background {
		z-index: -1;
		position: absolute;
		top: -20px;
		bottom: -20px;
		left: -20px;
		right: -20px;
	}

	background img {
		object-fit: fit;
		filter:blur(15px)
	} */

	.scrolly-slide-media {
		width: 100%;
		max-height: 80%;
		background: transparent;
		object-fit: contain;
	}

	.scrolly-slide-text {
		font-family: var(--scrolly-serif);
		margin: 0 20px;
		max-width: var(--scrolly-max-text-width);
		white-space: pre-wrap;
		line-height: 28px;
		color: black;
		font-size: 18px;
	}

	.scrolly-slide-text :global(a) {
		color: var(--scrolly-link-color);
	}

	.scrolly-slide-text :global(a):hover {
		text-decoration: none;
	}

	.scrolly-slide-iframe {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		width: 100%;
	}

	.scrolly-slide-iframe :global(iframe) {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}

	.scrolly-slide-message {
		font-family: var(--scrolly-sans);
		aspect-ratio: 16 / 9;
		width: 100%;
		background: #eee;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
	}

	.scrolly-slide-caption {
		font-family: var(--scrolly-sans);
		color: black;
		padding: 15px 0;
		font-size: 14px;
		line-height: 18px;
		align-self: flex-start;
	}

	@media (max-width: 800px) {
		figure {
			padding: 0;
		}
		.scrolly-slide-text {
			font-size: 16px;
			line-height: 20px;
		}

		.scrolly-slide-caption {
			padding: 15px;
		}
	}
</style>
