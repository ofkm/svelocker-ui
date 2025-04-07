<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import TextBadge from '$lib/components/badges/text-badge.svelte';
	import CountBadge from '$lib/components/badges/count-badge.svelte';
	import type { RegistryRepo } from '$lib/types/api/registry';

	export let repo: RegistryRepo;

	// Fixed helper function to get repository URL path with proper handling of 'library' and nested repos
	function getRepoPath(repoName: string): string {
		// For nested repos like 'ofkm/caddy', we need to handle them correctly
		// The repository name itself should be included in the path
		return `${repoName}/`;
	}

	// Helper to extract just the simple name from a path (getting "caddy" from "ofkm/caddy")
	function getSimpleName(fullName: string): string {
		// If the name contains a slash, take only the last part
		if (fullName.includes('/')) {
			return fullName.split('/').pop() || fullName;
		}
		return fullName;
	}

	// Helper to construct correct image URLs
	function getImageUrl(repoName: string, imageName: string): string {
		return `/details/${repoName}/${imageName}`;
	}

	// Add a helper function to sanitize names for data-testid
	function sanitizeForTestId(text: string): string {
		// Replace any characters that might cause issues in CSS selectors
		return text.replace(/[^a-zA-Z0-9-]/g, '-');
	}
</script>

<div class="repo-card bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden transition-all hover:shadow-md hover:border-border/80 flex flex-col h-full" data-testid="repository-card-{repo.name}">
	<div class="p-5 flex-grow">
		<!-- Header section with repo name and badge -->
		<div class="flex justify-between items-start mb-3">
			<div>
				<h3 class="text-xl font-medium tracking-tight text-foreground">{repo.name}</h3>
				<p class="text-sm text-muted-foreground mt-1">
					{repo.images.length}
					{repo.images.length === 1 ? 'Image' : 'Images'}
				</p>
			</div>

			{#if repo.name === 'library'}
				<TextBadge text="Default Namespace" variant="info" />
			{/if}
		</div>

		<!-- Images section -->
		<div class="space-y-4">
			{#each repo.images.slice(0, 3) as image, i}
				<div class="bg-background/60 rounded-lg p-3 border border-border/30" data-testid="image-container-{sanitizeForTestId(image.name)}">
					<div class="flex items-center justify-between mb-2">
						<!-- Display simplified image name -->
						<h4 class="font-medium text-sm">{getSimpleName(image.name)}</h4>
						<CountBadge count={image.tags.length} />
					</div>

					<!-- Tag pills with fixed URLs, but keep the FULL image.name for paths -->
					<div class="flex flex-wrap gap-2 mt-3">
						{#each image.tags.slice(0, 5) as tag}
							<a
								href="/details/{getRepoPath(repo.name)}{getSimpleName(image.name)}/{tag.name}"
								data-testid="tag-pill-{repo.name}-{sanitizeForTestId(image.name)}-{sanitizeForTestId(tag.name)}"
								data-sveltekit-preload-data="off"
								class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors min-w-[2.5rem] text-center
                  {tag.name === 'latest' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800/80 hover:bg-green-200 dark:hover:bg-green-800/60' : 'bg-muted/50 text-foreground/80 hover:bg-muted border border-border/40 hover:border-border/60'}"
							>
								{tag.name}
							</a>
						{/each}

						{#if image.tags.length > 5}
							<a href={getImageUrl(repo.name, getSimpleName(image.name))} class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 min-w-[2.5rem] text-center">
								+{image.tags.length - 5} more
							</a>
						{/if}
					</div>
				</div>
			{/each}

			{#if repo.images.length > 3}
				<a href={`/details/${repo.name}`} class="flex items-center justify-center w-full py-2 rounded-lg bg-muted/20 text-sm text-muted-foreground hover:bg-muted/40 transition-colors">
					View all {repo.images.length} images
				</a>
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
