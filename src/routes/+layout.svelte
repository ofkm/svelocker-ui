<script>
	import '../app.css';
	import Header from '$lib/components/header/header.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/stores';
	let { children, data } = $props();

	// Get registry name for title (if available)
	let registryName = $page.data.settings?.registry_name || 'Docker Registry';
</script>

<div class="relative flex flex-col w-full text-sm sm:text-base min-h-screen max-h-full">
	<Header {data} />
	<ModeWatcher />

	{@render children()}
</div>
<Toaster />
