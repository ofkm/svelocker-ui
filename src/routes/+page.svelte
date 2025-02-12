<script lang="ts">
    import Repo from '$lib/components/repo.svelte';
		import type { PageProps } from './$types';

		let { data }: PageProps = $props();

		//Testing Area
		import { fetchDockerMetadata } from '$lib/utils/manifest.ts'

		// fetchDockerMetadata("https://kmcr.cc", "ofkm/caddy", "latest")
		// 	.then(data => console.log("Extracted Metadata:", data))
		// 	.catch(error => console.error("Fetch error:", error));
		//
</script>

<svelte:head>
	<title>Svelocker UI</title>
</svelte:head>

<div class="flex min-h-screen max-h-screen w-full flex-col justify-between bg-muted/80">
	{#if data.repos.repositories.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
			<Repo repos={data.repos.repositories} />
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
			<h2 class="text-lg poppins">Could not pull registry data...</h2>
		</div>
	{/if}

</div>



