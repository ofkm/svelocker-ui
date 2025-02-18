<script lang="ts">
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';
	import type { RegistryRepo } from '$lib/models/repo.ts';

	export let filteredData: RegistryRepo[];
</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
	{#each filteredData as repo, index}
		<CollapsibleCard id={repo.name} title={repo.name} description={repo.images.length > 1 ? repo.images.length.toString() + ' Tags Found' : repo.images.length.toString() + ' Tag Found'}>
			<RepoImage repoIndex={index} {filteredData} />
			<div class="clearfix"></div>
		</CollapsibleCard>
	{/each}
</div>
