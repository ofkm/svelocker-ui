<script lang="ts">
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';
	import type { PageData } from '../../routes/$types';
	import type { RegistryRepo } from '$lib/models/repo.ts';

	export let data: PageData;
	export let filteredData: RegistryRepo[];


</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
	{#each filteredData as repo, index}
		<CollapsibleCard id={repo.name} title={repo.name} description="{repo.images.length.toString()} Tags Found">
			<RepoImage repoIndex={index} data={data}/>
		</CollapsibleCard>
	{/each}
</div>
