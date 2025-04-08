<script lang="ts">
	import { Home, Slash, Database, Tag } from 'lucide-svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.ts';
	import TextBadge from '$lib/components/badges/text-badge.svelte';
	import CountBadge from '$lib/components/badges/count-badge.svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { formatSize } from '$lib/utils/formatting/size';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// These will be populated by your page data logic later
	let imageName = data.imageName;
	let repoName = data.repoName;
	let tags = data.image.tags || [];
</script>

<div class="mx-auto py-6 flex-1 w-full flex-col bg-background">
	<div class="w-full flex-col justify-between max-w-[95%] mx-auto">
		<!-- Breadcrumb Navigation -->
		<div class="bg-card/30 border border-border/40 rounded-lg p-2 backdrop-blur-sm mb-4">
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
						<Breadcrumb.Link href="/details/{repoName}" class="text-muted-foreground hover:text-foreground transition-colors">
							{repoName}
						</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator>
						<Slash class="h-4 w-4" />
					</Breadcrumb.Separator>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/details/{repoName}/{imageName}" class="text-foreground font-medium">
							{imageName}
						</Breadcrumb.Link>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>

		<!-- Header Section -->
		<div class="mb-6 bg-card/90 backdrop-blur-sm rounded-xl shadow-sm border border-border/60 p-6">
			<div class="flex flex-col md:flex-row justify-between items-start gap-6">
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<Database class="h-6 w-6 text-primary/70" />
						<h2 class="text-3xl font-semibold tracking-tight flex items-center gap-2">
							{imageName}
							{#if repoName === 'library'}
								<TextBadge text="Default Namespace" variant="info" />
							{/if}
						</h2>
					</div>
					<div class="flex items-center gap-2.5">
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground">Total Tags:</span>
							<span class="font-medium">{tags.length}</span>
						</div>
						<!-- <span class="text-muted-foreground">•</span>
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground">Last Updated:</span>
							<span>{formatDistanceToNow(new Date())} ago</span>
						</div> -->
					</div>
				</div>
			</div>
		</div>

		<!-- Tags List -->
		<div class="mx-0 mb-16">
			<div class="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-sm">
				<div class="border-b border-border/30 px-5 py-3 bg-muted/10 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<Tag class="h-5 w-5 text-primary/70" />
						<h3 class="text-lg font-medium">Available Tags</h3>
					</div>
					<CountBadge count={tags.length} label="tags" variant="primary" />
				</div>

				<div class="divide-y divide-border/30">
					{#each tags as tag}
						<div class="px-5 py-4 hover:bg-muted/30 transition-colors">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									<a href="/details/{repoName}/{imageName}/{tag.name}" class="text-lg font-medium hover:text-primary transition-colors">
										{tag.name}
									</a>
									{#if tag.name === 'latest'}
										<TextBadge text="Latest Version" variant="success" />
									{/if}
								</div>
								<div class="flex items-center gap-4 text-sm text-muted-foreground">
									<span>{formatSize(tag.metadata?.totalSize || 0)}</span>
									<span>•</span>
									<span>Updated {formatDistanceToNow(tag.metadata?.created || new Date())} ago</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
