<script lang="ts">
    import Repo from '$lib/components/repo.svelte';
		import { getRegistryRepos } from '$lib/utils/repos.ts'

		let reposArray = [] as { name: string, image?: string  }[];

		// Call the function with the specified URL
		getRegistryRepos('https://kmcr.cc/v2/_catalog')
			.then(data => {
				reposArray = data.repositories;
			})
			.catch(error => console.error('Error:', error));

</script>

<svelte:head>
	<title>Svelocker UI</title>
</svelte:head>

<div class="flex min-h-screen w-full flex-col justify-between bg-muted/80">
	{#if reposArray.length > 0}
	<Repo repos={reposArray} />
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
			<h2 class="text-lg poppins">Could not pull registry data...</h2>
		</div>
	{/if}
</div>


