<script lang="ts">
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';
	import type { RegistryRepo } from '$lib/models/repo.ts';
	import { formatDistanceToNow } from 'date-fns';

	export let filteredData: RegistryRepo[];
	export let lastSyncTime: string | Date | undefined = undefined;

	// Format the global last sync time
	$: formattedGlobalLastSync = lastSyncTime ? `Last synced ${formatDistanceToNow(new Date(lastSyncTime))} ago` : 'Never synced';

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

	// Function to format repo's last sync date
	function formatRepoLastSync(repo: RegistryRepo): string {
		if (!repo.lastSynced) return '';
		return `Last synced ${formatDistanceToNow(new Date(repo.lastSynced))} ago`;
	}
</script>

<div data-testid="repository-list" class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
	{#each Object.entries(groupedData) as [repoName, repos]}
		<!-- Use the repo's own lastSynced property instead of the global lastSyncTime -->
		<!-- Only if available, otherwise fall back to global lastSyncTime -->
		{@const repoLastSynced = formatRepoLastSync(repos[0])}
		<CollapsibleCard id={repoName} title={repoName} description={`${repos[0].images.length} ${repos[0].images.length > 1 ? 'Images' : 'Image'} Found`} lastSynced={repoLastSynced || formattedGlobalLastSync}>
			{#each repos as repo, index}
				<RepoImage repoIndex={index} filteredData={[repo]} />
			{/each}
			<div class="clearfix"></div>
		</CollapsibleCard>
	{/each}
</div>
