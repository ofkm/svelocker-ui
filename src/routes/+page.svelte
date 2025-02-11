<script lang="ts">
    import Repo from '$lib/components/repo.svelte';
		import type { PageProps } from './$types';

		let { data }: PageProps = $props();


</script>

<svelte:head>
	<title>Svelocker UI</title>
</svelte:head>

<div class="flex min-h-screen w-full flex-col justify-between bg-muted/80">
	{#if data.repos.repositories.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
			<Repo repos={data.repos.repositories} />
		</div>
	{:else}
			<h2 class="text-lg poppins">Could not pull registry data...</h2>

	{/if}

</div>



