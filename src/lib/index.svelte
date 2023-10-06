<script>
	import { onMount } from 'svelte';
	import Slides from '$lib/components/Slides.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Message from '$lib/components/Message.svelte';
	import download_doc from '$lib/utils/download_doc.js';
	import doc_to_props from '$lib/utils/doc_to_props.js';
	import TitleSlide from './components/TitleSlide.svelte';
	import Promo from './components/Promo.svelte';

	let props;
	let error;
	let iframe = false;
	let url;

	onMount(async () => {
		try {
			iframe = window.self !== window.top;
			url = new URL(window.location.href);
			const id = url.searchParams.get('id');
			const doc = await download_doc(id);
			props = await doc_to_props(doc);
		} catch (e) {
			console.error(e);
			error = e.message;
		}
	});
</script>

<div>
	{#if iframe}
		<Promo {props} {url} />
	{:else}
		<main>
			<TitleSlide title={props?.title} credit={props?.credit} cover={props?.cover} />
			{#if props?.slides?.length}
				<Slides {...props} />
			{:else if error}
				<Message>
					{error}
				</Message>
			{:else}
				<Message>
					<Loading />
				</Message>
			{/if}
		</main>
	{/if}

</div>

<style>
	main {
		position: relative;
	}

</style>
