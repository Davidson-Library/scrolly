<script>
	export let title;
	export let credit;
	export let cover;
	export let hover = false;
</script>

<section class:cover class:hover>
	{#if cover}
		{#await cover then { value }}
			<img src={value} alt="cover" fetchpriority="high" />
		{/await}
	{/if}
	{#if title || credit}
		<div class="title-container">
			<div class="title">
				<h1>{@html title}</h1>
				<p>{@html credit}</p>
			</div>
		</div>
	{/if}
</section>

<style>
	section {
		all: unset;
		height: 100vh;
		width: 100vw;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
		background: black;
		overflow: hidden;
		/* box-shadow: 0px 4px 8px hsl(0deg 0% 0% / 25%); */
	}

	.title-container {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 0;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cover .title-container {
		align-items: flex-end;
		justify-content: flex-start;
		background: linear-gradient(transparent, transparent, black);
	}

	.title {
		position: relative;
		z-index: 1;
		color: white;
		padding: 20px 20px;
		margin: 40px 20px;
		border-radius: 5px;
	}

	h1 {
		all: unset;
		display: block;
		font-weight: 500;
		font-size: 40px;
		line-height: 50px;
	}

	p {
		all: unset;
		position: relative;
		z-index: 1;
		display: block;
		font-family: var(--scrolly-sans);
		font-size: 18px;
		line-height: 2;
	}

	img {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
		top: 0;
		transition: transform 0.3s;
	}

	section.hover:hover img {
		transform: scale(1.075);
	}
</style>
