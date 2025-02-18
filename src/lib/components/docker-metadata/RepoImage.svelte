<script lang="ts">
	import MetadataDrawer from '$lib/components/docker-metadata/MetadataDrawer.svelte';
	import type { RegistryRepo } from '$lib/models/repo.ts';

	export let repoIndex: number;
	export let filteredData: RegistryRepo[];
</script>

<!-- TODO Implement Table here, and rewrite image/tag logic -->
{#if filteredData[repoIndex].images.length > 0}
	{#each filteredData[repoIndex].images as tag, tagIndex}
		{#if tag.name === 'latest'}
			<MetadataDrawer {tag} repo={filteredData[repoIndex].name} {repoIndex} {tagIndex} isLatest={true} data={filteredData} />
		{:else}
			<MetadataDrawer {tag} repo={filteredData[repoIndex].name} {repoIndex} {tagIndex} isLatest={false} data={filteredData} />
		{/if}
	{/each}
{:else}
	<p class="text-lg font-light">No Tags Found.</p>
{/if}
