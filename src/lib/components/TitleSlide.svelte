<script>
	export let title;
	export let credit;
	export let cover;
</script>

<section style:--background={cover ? 'black' : 'white'}>
	{#if title || credit}
	<div>
		<h1>{@html title}</h1>
		<hr />
		<p>{@html credit}</p>
	</div>
	{/if}
	{#if cover}
		 <img src={cover} alt="cover" fetchpriority="high" />
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
		box-shadow: 0px 4px 8px hsl(0deg 0% 0% / 25%);
		z-index: 1;
		background: var(--background);
	}

	div {
		position: relative;
		z-index: 1;
		background: rgb(0, 0, 0, 0.75);
		color: white;
		padding: 20px 20px;
		margin: 20px;
		border-radius: 5px;
		box-shadow: 2px 2px 3px rgb(0 0 0 / 40%);
	}

	h1 {
		all: unset;
		display: block;
		font-weight: 500;
		font-size: 40px;
		line-height: 50px;
	}

	hr {
		all: unset;
		display: block;
		box-sizing: border-box;
		border-bottom: 1px solid white;
		margin: 20px 0;
		width: 100px;
	}

	p {
		all: unset;
		position: relative;
		z-index: 1;
		display: block;
		font-family: var(--scrolly-sans);
		font-size: 18px;
		line-height: 24px;
	}

	img {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
		top: 0;
	}
</style>
