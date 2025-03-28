<script lang="ts">
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import RepoImage from '$lib/components/docker-metadata/RepoImage.svelte';
	import type { RegistryRepo } from '$lib/models/repo.ts';
	import { formatDistanceToNow } from 'date-fns';
	import { Database, Box } from 'lucide-svelte';

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

<div data-testid="repository-list" class="grid grid-cols-1 gap-6">
	{#if Object.keys(groupedData).length === 0}
		<div class="flex flex-col items-center justify-center p-12 text-center rounded-xl border bg-card/40 backdrop-blur-sm shadow-sm transition-all">
			<Database class="h-12 w-12 text-muted-foreground/40 mb-4" />
			<h3 class="text-xl font-medium text-muted-foreground">No repositories found</h3>
			<p class="mt-2 text-sm text-muted-foreground/80">Repositories will appear here once they're synchronized</p>
		</div>
	{:else}
		{#each Object.entries(groupedData) as [repoName, repos]}
			{@const repoLastSynced = formatRepoLastSync(repos[0])}
			<CollapsibleCard id={repoName} title={repoName} description={`${repos[0].images.length} ${repos[0].images.length > 1 ? 'Images' : 'Image'} Found`} lastSynced={repoLastSynced || formattedGlobalLastSync}>
				<div class="space-y-6">
					{#each repos as repo, index}
						<div class="repo-image-container">
							<RepoImage repoIndex={index} filteredData={[repo]} />
						</div>
					{/each}
				</div>
			</CollapsibleCard>
		{/each}
	{/if}
</div>

<style>
	.repo-image-container {
		position: relative;
		transition: all 0.25s ease;
	}

	.repo-image-container:not(:last-child) {
		margin-bottom: 2rem;
	}

	.repo-image-container:hover {
		transform: translateY(-2px);
	}

	@media (prefers-reduced-motion) {
		.repo-image-container {
			transition: none;
		}
		.repo-image-container:hover {
			transform: none;
		}
	}
</style>
