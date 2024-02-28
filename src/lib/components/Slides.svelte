<script>
	import { fade } from 'svelte/transition';
	import Slide from './Slide.svelte';

	export let slides;

	let currIndex = -1;
	let rootEl;

	const intersectionOptions = {
		root: rootEl,
		rootMargin: '0px',
		threshold: [0.1, 0.25]
	};

	const observer = new IntersectionObserver((entries) => {
		const [entry] = entries;

		if (entry.isIntersecting) {
			currIndex = +entry.target.dataset.index;
		}
	}, intersectionOptions);

	function observe(node) {
		observer.observe(node);
	}
</script>

<section bind:this={rootEl}>
	<ol class="scrolly-annotations">
		{#each slides as { annotation }, index}
			<li class="scrolly-annotation">
				<span class="scrolly-annotation-text" use:observe data-index={index}>
					{@html annotation}
				</span>
			</li>
		{/each}
	</ol>
	<div class="scrolly-slides-outer">
		<ol class="scrolly-slides">
			{#each slides as { type, slide, alt_text, caption }, index}
				{@const visible = index === currIndex}
				{#if visible}
					<li
						transition:fade={{ delay: 0, duration: 200 }}
						class={`scrolly-slide scrolly-slide-${index}`}
						style:display={visible ? 'block' : 'none'}
					>
						<Slide {type} {slide} {alt_text} {caption} {visible} />
					</li>
				{/if}
			{/each}
		</ol>
	</div>
</section>

<style>
	:root {
		--scrolly-serif: garamond, serif;
		--scrolly-sans: arial, sans-serif;
		--scrolly-max-text-width: 600px;
		--scrolly-link-color: #003cbc;
	}

	ol,
	li,
	section,
	div {
		all: unset;
		display: block;
	}

	section {
		position: relative;
		background: white;
		font-family: var(--scrolly-serif);
	}

	@media (min-width: 800px) {
		section {
			display: grid;
			grid-template-columns: minmax(400px, 3fr) 7fr;
		}
	}

	.scrolly-annotations {
		background: black;
	}

	.scrolly-annotation {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60vh 0;
		white-space: pre-wrap;
	}

	.scrolly-annotation-text {
		padding: 20px 0;
		max-width: min(100%, 500px);
		background: rgb(0, 0, 0, 0.8);
		color: white;
		padding: 10px;
		z-index: 1;
		font-size: 22px;
		border-radius: 3px;
		line-height: 26px;
		font-weight: 300;
		margin: 20px;
		word-wrap: break-word;
		overflow: hidden;
	}

	@media (max-width: 800px) {
		.scrolly-annotation-text {
			font-size: 16px;
			line-height: 20px;
		}

		.scrolly-annotations {
			background: transparent;
			z-index: 1;
		}

		.scrolly-annotation-title {
			background: black;
			font-size: 16px;
			line-height: 20px;
			margin-bottom: 100vh;
		}

		.scrolly-annotation-text {
			font-size: 16px;
			line-height: 20px;
		}
	}

	.scrolly-annotation-text :global(a) {
		color: white;
	}

	.scrolly-annotation-text :global(a:hover) {
		text-decoration: none;
	}

	.scrolly-slides-outer {
		height: 100%;
		position: relative;
	}

	@media (max-width: 800px) {
		.scrolly-slides-outer {
			width: 100%;
			top: 0;
			position: absolute;
		}
	}

	.scrolly-slides {
		position: sticky;
		top: 0;
		height: 100vh;
		margin: 0;
	}

	.scrolly-slide {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		overflow: hidden;
	}
</style>
