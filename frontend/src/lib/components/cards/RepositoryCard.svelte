<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import TextBadge from '$lib/components/badges/text-badge.svelte';
	import type { Repository } from '$lib/types';

	export let repo: Repository;

	// Helper to extract just the repository name from a path (getting "caddy" from "ofkm/caddy")
	function getRepoName(fullName: string): string {
		if (fullName.includes('/')) {
			return fullName.split('/').pop() || fullName;
		}
		return fullName;
	}

	// Helper to construct correct image URLs
	function getImageUrl(repoName: string): string {
		return `/details/${repoName}`;
	}

	// Add a helper function to sanitize names for data-testid
	function sanitizeForTestId(text: string): string {
		return text.replace(/[^a-zA-Z0-9-]/g, '-');
	}
</script>

<div class="repo-card bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden transition-all hover:shadow-md hover:border-border/80 flex flex-col h-full" data-testid="repository-card-{repo.name}">
	<div class="p-5 flex-grow">
		<!-- Header section with namespace name and badge -->
		<div class="flex justify-between items-start mb-3">
			<div>
				<a href={`/details/${repo.name}`} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
					<h3 class="text-xl font-medium tracking-tight text-foreground">{repo.name}</h3>
				</a>

				<p class="text-sm text-muted-foreground mt-1">
					{(repo.images || []).length}
					{(repo.images || []).length === 1 ? 'Image' : 'Images'}
				</p>
			</div>

			{#if repo.name === 'library'}
				<TextBadge text="Default Namespace" variant="info" />
			{/if}
		</div>

		<!-- Images section -->
		<div class="mt-4">
			{#if (repo.images || []).length > 0}
				<div class="space-y-2">
					{#each repo.images || [] as image}
						<div class="bg-background/60 rounded-lg p-3 border border-border/30 hover:bg-background hover:border-border/50 transition-all" data-testid="image-row-{sanitizeForTestId(image.name)}">
							<div class="flex items-center justify-between">
								<a href={getImageUrl(image.name)} class="flex-1">
									<h4 class="font-medium text-sm">{getRepoName(image.name)}</h4>
								</a>
								<div class="flex items-center gap-2">
									<span class="text-xs text-muted-foreground">{(image.tags || []).length} tags</span>
								</div>
							</div>

							{#if (image.tags || []).length > 0}
								<div class="mt-2">
									<div class="flex flex-wrap gap-1">
										{#each image.tags || [] as tag}
											<a
												href={`/details/${image.name}/${tag.name}`}
												class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors
												{tag.name === 'latest' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-muted/50 text-foreground/80 hover:bg-muted'}"
											>
												{tag.name}
											</a>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				{#if (repo.images || []).length > 3}
					<a href={`/details/${repo.name}`} class="flex items-center justify-center w-full py-2 rounded-lg bg-muted/20 text-sm text-muted-foreground hover:bg-muted/40 transition-colors mt-3">
						View all {(repo.images || []).length} images
					</a>
				{/if}
			{:else}
				<div class="text-center p-4 bg-muted/20 rounded-lg">
					<p class="text-sm text-muted-foreground">No images found in this namespace</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer section with last synced info -->
	<div class="border-t border-border/30 px-5 py-3 bg-muted/10 flex items-center text-xs text-muted-foreground mt-auto">
		<div class="inline-block w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></div>
		{repo.lastSynced ? `Last synced ${formatDistanceToNow(new Date(repo.lastSynced))} ago` : 'Never synced'}
	</div>
</div>

<style>
	.repo-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		transition: all 0.2s ease;
	}

	.repo-card:hover {
		transform: translateY(-2px);
	}

	@media (prefers-reduced-motion) {
		.repo-card:hover {
			transform: none;
		}
	}
</style>
