<script>
    import TitleSlide from "./TitleSlide.svelte";
	export let props;
    export let url;

</script>

<a href={url} target="_blank">
        <TitleSlide title={props?.title} credit={props?.credit} cover={props?.cover} hover />
        <span>
        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>
        </span>
</a>

<style>
	span {
		color: white;
		background-color: transparent;
        background: rgba(0, 0, 0, 0.4);
	    position: fixed;
		bottom: 10px;
		right: 10px;
		padding: 2px;
		border-radius: 50%;
		display: flex;
		border: 3px solid transparent;
		z-index: 1;
        pointer-events: none;
        transition: all .3s;
	}

	svg {
		fill: white;
		transform: scale(0.7);
	}

    a {
        text-decoration: none;
    }

    a:hover span {
        background: rgba(0, 0, 0, 0.9);
        border-color: rgba(255,255,255, 1);
    }
</style>