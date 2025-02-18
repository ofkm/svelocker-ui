<script lang="ts">
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';
	import type { RegistryRepo } from '$lib/models/repo.ts';

	export let filteredData: RegistryRepo[];

	// Group the data by repo name
	$: groupedData = filteredData.reduce(
		(acc, repo) => {
			const name = repo.name;
			if (!acc[name]) {
				acc[name] = [];
			}
			acc[name].push(repo);
			return acc;
		},
		{} as Record<string, RegistryRepo[]>
	);
</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
	{#each Object.entries(groupedData) as [repoName, repos]}
		<CollapsibleCard id={repoName} title={repoName} description={`${repos.length} ${repos.length > 1 ? 'Images' : 'Image'} Found`}>
			{#each repos as repo, index}
				<RepoImage repoIndex={index} filteredData={[repo]} />
			{/each}
			<div class="clearfix"></div>
		</CollapsibleCard>
	{/each}

	<!-- Old Version -->
	<!-- {#each filteredData as repo, index}
		<CollapsibleCard id={repo.name} title={repo.name} description={repo.images.length > 1 ? repo.images.length.toString() + ' Images Found' : repo.images.length.toString() + ' Image Found'}>
			<RepoImage repoIndex={index} {filteredData} />
			<div class="clearfix"></div>
		</CollapsibleCard>
	{/each} -->
</div>
