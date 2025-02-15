<script>
	let { children } = $props();
	import '../app.css';
	import Header from '$lib/components/header/header.svelte';
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import { ModeWatcher } from "mode-watcher";
</script>

<div class="relative flex flex-col w-full text-sm sm:text-base min-h-screen max-h-full">
	<Header />
	<ModeWatcher />

	{@render children()}
</div>
<Toaster />