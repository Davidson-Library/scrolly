<script>
	import { onMount } from 'svelte';
	import download_doc from '$lib/utils/download_doc.js';
	import get_snippet from '$lib/utils/get_snippet';
	import { base } from '$app/paths';

	const TEMPLATE_LINK = `https://docs.google.com/document/d/1TavVvjGEsgbP22xQ0elc_6_fxHIxjqyLXZhzEE3UA2k`;
	const FAQ_LINK =
		'https://docs.google.com/document/d/e/2PACX-1vQCjUjR49YvH9A_kH32RKwOgbYfuBE8WQC1KZ3L6mKihIoDjy6fIOggErjuGXXSL9FB7jO2RVWboeF5/pub';

	const INSTRUCTIONS_LINK =
		'https://docs.google.com/document/d/e/2PACX-1vQ8ubzpKmOpkacnY0s3ykzkB1y_ZYBTpl0ynFTLuy-nKHj249jJRntR3J6kK4NCka34Vut6P4NMVLid/pub';
	let input;
	let embed_url = 'Loading...';
	let snippet = 'Loading...';

	onMount(() => {
		input.focus();
		set_id(TEMPLATE_LINK);
	});

	let validity = '';

	async function handle_input() {
		const link = input.value;

		validity = '';

		if (!link) {
			set_id(TEMPLATE_LINK);
		} else {
			try {
				set_id(link);
				await download_doc(link);
			} catch (e) {
				validity = e.message;
			}
		}

		input.setCustomValidity(validity);
	}

	function get_preview_link(id) {
		const extension = import.meta.env.DEV ? '' : '.html';
		return `${base}/v1/embed${extension}?id=${id}`;
	}

	function set_id(id) {
		embed_url = new URL(get_preview_link(id), window.location.origin).toString();
		snippet = get_snippet(embed_url);
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<body>
	<main>
		<nav>
			<a href={get_preview_link(TEMPLATE_LINK)} rel="external">Example</a>
			<a href={INSTRUCTIONS_LINK} rel="external">Instructions</a>
			<a href={FAQ_LINK} target="_blank" rel="external nofollow">F.A.Q.</a>
			<a href="https://github.com/Davidson-Library/scrolly" target="_blank" rel="external nofollow"
				>Github</a
			>
		</nav>
		<h1>ScrollyTeller</h1>
		<h2>Generate scroll-driven stories with Google Docs</h2>
		<h3>Make a ScrollyTeller</h3>
		<ol>
			<li>
				<p>
					<a target="blank" rel="external nofollow" href={`${TEMPLATE_LINK}/copy`}>Make a copy </a> of
					the ScrollyTeller template document.
				</p>
			</li>
			<li>
				<p>
					Follow the <a href={INSTRUCTIONS_LINK}>instructions</a> to customize the template document.
				</p>
			</li>
			<li>
				<p>
					<a
						target="blank"
						rel="external nofollow"
						href="https://support.google.com/a/users/answer/9308870"
						>Publish your Google Doc to the web</a
					>, so that anyone can view it.
				</p>
			</li>
			<li>
				<p>Paste the link to your published Google Doc below.</p>
				<form on:submit|preventDefault={handle_input}>
					<input
						type="text"
						name="link"
						class="border padding"
						placeholder={TEMPLATE_LINK}
						required
						bind:this={input}
						on:change|preventDefault={handle_input}
					/>
				</form>
				{#if validity}
					<p class="error-message">{validity}</p>
				{/if}
			</li>
			<li>
				<p>Use this url to link directly to your ScrollyTeller.</p>
				<span class="scrolly-url copy-box padding">
					<code><a target="_blank" rel="external nofollow" href={embed_url}>{embed_url}</a></code>
				</span>
				<p>Or, copy the snippet below and embed a share card it into your website code.</p>
				<code class="copy-box padding">{snippet}</code>
			</li>

			{@html snippet}
		</ol>
	</main>
	<footer>
		<p>Made by John-Michael Murphy and Dr. Suzanne Churchill</p>
	</footer>
</body>

<style>
	:root {
		--sfe-black: #1a1a1a;
		--sfe-font-family: 'Roboto', sans-serif;
		font-family: var(--sfe-font-family);
		color: var(--sfe-black);
	}

	body {
		all: unset;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	main {
		display: block;
		margin: 30px;
	}

	nav {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 20px;
	}

	h1 {
		all: unset;
		display: block;
		font-size: 3rem;
		font-weight: 500;
		margin-top: 30px;
		color: var(--sfe-black10);
	}

	h2 {
		all: unset;
		display: block;
		color: var(--sfe-black);
		font-weight: 200;
		font-size: 1.3rem;
		line-height: 1.3;
	}

	h3 {
		all: unset;
		display: block;
		font-size: 1.7rem;
		font-weight: 300;
		color: var(--sfe-black);
		margin-top: 40px;
		margin-bottom: 15px;
	}

	ol {
		all: unset;
		list-style: decimal;
		list-style-position: inside;
		display: block;
		font-size: 1.1rem;
	}

	li {
		font-weight: bold;
		padding-bottom: 15px;
	}

	p {
		padding-left: 5px;
		display: inline;
		font-weight: 300;
	}

	a {
		color: var(--sfe-black);
	}

	a:hover {
		text-decoration: none;
	}

	input[type='text'] {
		font-family: var(--sfe-font-family);
		font-weight: 200;
		flex-grow: 1;
		background-color: white;

		font-size: 1.1rem;
		font-weight: 300;
		color: var(--sfe-black);
		text-indent: 5px;

		display: block;
		width: 100%;
		box-sizing: border-box;

		border-radius: 5px;
		padding: 10px;
		border: 1px solid #00000080;
	}

	input[type='text']:focus {
		border-color: var(--sfe-black);
	}

	input[type='text']::placeholder {
		color: black;
		opacity: 0.4;
	}

	input[type='text']::invalid {
		background: blue;
	}

	input:focus::placeholder {
		opacity: 0;
	}

	code {
		all: unset;
		display: block;
		font-weight: 300;
		font-size: 0.9rem;
		font-family: monospace;
		white-space: pre-wrap;
		word-break: break-word;
		color: var(--sfe-black);
		box-sizing: border-box;
	}

	.copy-box {
		border: 1px solid #eaeaea;
		background: #f5f5f5;
		border-radius: 5px;
		padding: 10px;
		cursor: text;
	}

	.error-message {
		display: block;
		color: #da0000;
		font-size: 0.9rem;
		font-family: monospace;
		font-weight: 600;
		word-break: break-word;
	}

	.padding {
		margin: 15px 0;
	}

	.scrolly-url {
		display: flex;
		align-items: center;
	}

	.scrolly-url code {
		flex-grow: 1;
	}

	footer {
		padding: 20px 30px;
	}

	footer p {
		all: unset;
		font-size: 0.8rem;
		width: 100%;
		display: block;
		text-align: center;
		color: var(--sfe-black);
	}
</style>
