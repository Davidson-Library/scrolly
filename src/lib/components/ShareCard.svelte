<script>
	export let props;
	export let url;
</script>

{#if props}
	<a href={url} target="_blank" rel="noreferrer">
		{#await props?.cover then { value }}
			<img src={value} alt="cover" fetchpriority="high" />
		{/await}
		<span>
			<h1>{props?.title}</h1>
			<h2>{props?.credit}</h2>
		</span>
		<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40">
			<path
				d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"
			/>
		</svg>
	</a>
{/if}

<style>
	a {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: #333;
	}

	svg {
		position: absolute;
		top: 17.5px;
		right: 17.5px;
		z-index: 1;
		pointer-events: none;
		fill: white;
	}

	span {
		bottom: 0;
		position: absolute;
		z-index: 1;
		color: #333;
		left: 0;
		right: 0;
		border-top: 1px solid #cccccc;
		background: white;
		padding: 15px;
	}

	img {
		object-fit: cover;
		width: 100%;
		height: 100%;
	}

	a:hover h1,
	a:active h1,
	a:focus h1 {
		text-decoration: underline;
	}

	h1,
	h2 {
		margin: 0;
		padding: 0;
		font-family: var(--scrolly-sans);
		font-weight: 500;
	}

	h1 {
		font-size: 1.4rem;
		margin-bottom: 5px;
		font-weight: 700;
	}

	h2 {
		font-size: 1rem;
	}
</style>
