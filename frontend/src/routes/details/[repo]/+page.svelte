<script lang="ts">
	import { Home, Slash, Database, ArrowLeft, Layers } from 'lucide-svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import CountBadge from '$lib/components/badges/count-badge.svelte';
	import TextBadge from '$lib/components/badges/text-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { formatDistanceToNow } from 'date-fns';
	import type { PageData } from './$types';
	import type { Repository, Image, Tag } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Handle potential undefined repository data more carefully
	let repo = $derived(data?.repository || { name: '', images: [] }) as Repository;
	let repoName = $derived(data?.repoName || 'Unknown');

	// Helper to construct correct detail URLs
	function getDetailUrl(repoName: string, imageName: string, tagName: string): string {
		return `/details/${repoName}/${imageName}/${tagName}`;
	}

	// Helper to extract just the simple name from a path (getting "caddy" from "ofkm/caddy")
	function getSimpleName(fullName: string): string {
		return fullName.includes('/') ? fullName.split('/').pop() || fullName : fullName;
	}

	// Fix Button event
	function goBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>Svelocker UI - Repository: {repoName}</title>
</svelte:head>

<div class="mx-auto w-full flex-col bg-background">
	<div class="w-full flex-col justify-between max-w-[95%] mx-auto pt-5 pb-5">
		<!-- Breadcrumb Navigation -->
		<div class="bg-card/30 border border-border/40 rounded-lg p-2 backdrop-blur-sm mb-4 mx-10">
			<Breadcrumb.Root>
				<Breadcrumb.List class="py-1">
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/" class="text-muted-foreground hover:text-foreground transition-colors">
							<Home class="h-4 w-4 mr-1 inline-flex" />
							<span>Home</span>
						</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator>
						<Slash class="h-4 w-4" />
					</Breadcrumb.Separator>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/details/{repoName}" class="text-foreground font-medium">
							{repoName}
						</Breadcrumb.Link>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>

		<!-- Header Section -->
		<div class="mb-6 bg-card/90 backdrop-blur-sm rounded-xl shadow-sm border border-border/60 p-6 mx-10">
			<div class="flex flex-col md:flex-row justify-between items-start gap-6">
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<Database class="h-6 w-6 text-primary/70" />
						<h2 class="text-3xl font-semibold tracking-tight flex items-center gap-2">
							{repoName}
							{#if repoName === 'library'}
								<TextBadge text="Default Namespace" variant="info" />
							{/if}
						</h2>
					</div>
					<div class="flex items-center gap-2.5">
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground">Total Images:</span>
							<span class="font-medium">{Array.isArray(repo?.images) ? repo.images.length : 0}</span>
						</div>
						<span class="text-muted-foreground">•</span>
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground">Last Synced:</span>
							<span>{repo?.lastSynced ? formatDistanceToNow(new Date(repo.lastSynced)) + ' ago' : 'Never'}</span>
						</div>
					</div>
				</div>
				<Button variant="outline" class="gap-2" onclick={goBack}>
					<ArrowLeft class="h-4 w-4" />
					Go Back
				</Button>
			</div>
		</div>

		<!-- Repository Images List -->
		<div class="mx-10 mb-16">
			<div class="space-y-4">
				{#if !Array.isArray(repo?.images) || repo.images.length === 0}
					<div class="p-8 text-center bg-card/50 rounded-xl border border-border/40">
						<Layers class="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
						<h3 class="text-lg font-medium">No Images Found</h3>
						<p class="text-muted-foreground">This repository doesn't have any images yet.</p>
					</div>
				{:else}
					<!-- Direct loop through images array without using groupedImages -->
					<div class="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-sm mb-6">
						<div class="border-b border-border/30 px-5 py-3 bg-muted/10 flex items-center">
							<h3 class="text-lg font-medium">{repoName}</h3>
							<CountBadge count={repo.images.length} label="images" variant="primary" customClass="ml-3" />
						</div>
						<div class="p-5 space-y-4">
							{#each repo.images as image}
								<div class="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-sm">
									<div class="border-b border-border/30 px-5 py-3 bg-muted/10 flex items-center">
										<a href={`/details/${image.fullName}`}>
											<h3 class="text-lg font-medium">{getSimpleName(image.name || '')}</h3>
										</a>

										<CountBadge count={Array.isArray(image.tags) ? image.tags.length : 0} label="tags" variant="primary" customClass="ml-3" />
									</div>
									<div class="p-5">
										<div class="flex flex-wrap gap-2">
											{#if !Array.isArray(image.tags) || image.tags.length === 0}
												<div class="w-full py-3 text-center text-muted-foreground">No tags available for this image</div>
											{:else}
												{#each image.tags as tag}
													<a
														href={getDetailUrl(repoName, getSimpleName(image.name || ''), tag.name)}
														class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors min-w-[2.5rem] text-center
														{tag.name === 'latest' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800/80 hover:bg-green-200 dark:hover:bg-green-800/60' : 'bg-muted/50 text-foreground/80 hover:bg-muted border border-border/40 hover:border-border/60'}"
													>
														{tag.name}
													</a>
												{/each}
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
