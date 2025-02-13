<script lang="ts">
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';
	import type { PageData } from '../../routes/$types';

	export let data: PageData;
</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
	{#each data.repos.repositories as repo, index}
		<CollapsibleCard id={repo.name} title={repo.name}>
			<RepoImage repoIndex={index} data={data}/>
		</CollapsibleCard>
	{/each}
</div>
