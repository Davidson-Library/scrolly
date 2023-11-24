<script>
	import TitleSlide from './TitleSlide.svelte';
	export let props;
	export let url;
</script>

<div>
	<a href={url} target="_blank" rel="noreferrer">
		<TitleSlide title={props?.title} credit={props?.credit} cover={props?.cover} hover />
		<span>
			<svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="0 -960 960 960" width="50"
				><path
					d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"
				/></svg
			>
		</span>
	</a>
</div>

<style>
	span {
		color: white;
		position: fixed;
		top: 20px;
		right: 20px;
		border-radius: 50%;
		display: flex;
		z-index: 1;
		pointer-events: none;
	}

	svg {
		fill: white;
	}

	div::before {
		content: '';
		width: 100%;
		display: block;
		height: 100%;
		background: transparent;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1;
		transition: all 0.3s ease-in-out;
	}
</style>
