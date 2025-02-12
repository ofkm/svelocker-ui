<script lang="ts">
	// import Card from "./Card.svelte";
	import CollapsibleCard from '$lib/components/dropdown-card.svelte';
	import { getDockerTagsNew } from '$lib/utils/tags.ts'
	import { badgeVariants } from "$lib/components/ui/badge/index.js";
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import * as Sheet from "$lib/components/ui/sheet";
	import { Input } from "$lib/components/ui/input/index.ts";
	import { Label } from "$lib/components/ui/label/index.ts";
	import { Separator } from "$lib/components/ui/separator/index.ts";

	//Models
	import type { ImageTag } from '$lib/models/tag.ts';
	//

	// Importing Icons
	import { AppWindowMac, CircuitBoard, CalendarCog, UserPen, GalleryHorizontalEnd } from 'lucide-svelte';

	export let repos;

	let tagsArray: ImageTag[] = [];

	getDockerTagsNew('https://kmcr.cc', 'ofkm/caddy')
		.then((repoImage) =>  {
			tagsArray = repoImage.tags
			repos.tags = repoImage.tags
		})
		.catch((error) => console.error("Error fetching repo images:", error));

	// const fetchTags = async (repo: string)  => {
	// 	const tags = await repoSpecificRun(repo.name);
	// 	repo.tags = tags;
	// }
	//
	// function repoSpecificRun(repo: string): ImageTag[] {
	// 	await getDockerTagsNew('https://kmcr.cc', repo)
	// 		.then((repoImage) =>  {
	// 			return repoImage.tags
	// 		})
	// 		.catch((error) => console.error("Error fetching repo images:", error));
	// }

</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
		{#each repos as repo}
		<CollapsibleCard id={repo.name} title={repo.name}>
			{#each repos.tags as tag}
			<!--{#each repoSpecificRun(repo.name) as tag}-->
				{#if tag.name === "latest"}
					<Sheet.Root>
						<Sheet.Trigger class="{buttonVariants({ variant: 'outline' })} badgeLinkLatest text-center border-solid">
							{tag.name}
						</Sheet.Trigger>
						<Sheet.Content side="right">
							<Sheet.Header>
								<Sheet.Title>{repo.name}:{tag.name}</Sheet.Title>
								<Sheet.Description>
									{#if tag.metadata}
										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger class="underline">SHA256 Digest</Tooltip.Trigger>
												<Tooltip.Content>
													<p>{tag.metadata.configDigest}</p>
												</Tooltip.Content>
											</Tooltip.Root>
										</Tooltip.Provider>
									{:else}
										No config Digest Found
									{/if}
								</Sheet.Description>
							</Sheet.Header>
							{#if tag.metadata}
							<div class="grid gap-4 py-4">
								<div class="grid grid-cols-2 gap-4 items-center">
									<Separator class="col-span-2" />
									<Label for="os" class="font-light text-muted-foreground flex items-center gap-2"><AppWindowMac width="16" height="16"/> OS</Label>
									<p class="text-sm font-semibold" id="os">{tag.metadata.os}</p>
									<Separator class="col-span-2" />
									<Label for="arch" class="font-light text-muted-foreground flex items-center gap-2"><CircuitBoard class="w-8 h-8"/> Arch</Label>
									<p class="text-sm font-semibold" id="arch">{tag.metadata.architecture}</p>
									<Separator class="col-span-2" />
									<Label for="created" class="font-light text-muted-foreground flex items-center gap-2"><CalendarCog class="w-8 h-8"/> Created</Label>
									<p class="text-sm font-semibold" id="created">{tag.metadata.created}</p>
									<Separator class="col-span-2" />
									<Label for="dockerVersion" class="font-light text-muted-foreground flex items-center gap-2"><GalleryHorizontalEnd class="w-8 h-8"/> Docker Version</Label>
									<p class="text-sm font-semibold" id="dockerVersion">{tag.metadata.dockerVersion}</p>
									{#if tag.metadata.author}
										<Separator class="col-span-2" />
										<Label for="author" class="font-light text-muted-foreground flex items-center gap-2"><UserPen class="w-8 h-8"/> Author</Label>
										<p class="text-sm font-semibold" id="author">{tag.metadata.author}</p>
									{/if}
									<Separator class="col-span-2" />
								</div>
							</div>
							{/if}
							<Sheet.Footer>
								<Sheet.Close class="{buttonVariants({ variant: 'outline' })} border-solid border-rose-600">
									Delete
								</Sheet.Close>
							</Sheet.Footer>
						</Sheet.Content>
					</Sheet.Root>
				{:else}
					<Sheet.Root>
						<Sheet.Trigger class="{buttonVariants({ variant: 'outline' })} badgeLink border border-solid border-white">
							<span class="text-center items-center font-light">{tag.name}</span>
						</Sheet.Trigger>
						<Sheet.Content side="right">
							<Sheet.Header>
								<Sheet.Title>{repo.name}:{tag.name}</Sheet.Title>
								<Sheet.Description>
									{#if tag.metadata}
										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger class="underline">SHA256 Digest</Tooltip.Trigger>
												<Tooltip.Content>
													<p>{tag.metadata.configDigest}</p>
												</Tooltip.Content>
											</Tooltip.Root>
										</Tooltip.Provider>
									{:else}
										No config Digest Found
									{/if}
								</Sheet.Description>
							</Sheet.Header>
							{#if tag.metadata}
								<div class="grid gap-4 py-4">
									<div class="grid grid-cols-2 gap-4 items-center">
										<Separator class="col-span-2" />
										<Label for="os" class="font-light text-muted-foreground flex items-center gap-2"><AppWindowMac width="16" height="16"/> OS</Label>
										<p class="text-sm font-semibold" id="os">{tag.metadata.os}</p>
										<Separator class="col-span-2" />
										<Label for="arch" class="font-light text-muted-foreground flex items-center gap-2"><CircuitBoard class="w-8 h-8"/> Arch</Label>
										<p class="text-sm font-semibold" id="arch">{tag.metadata.architecture}</p>
										<Separator class="col-span-2" />
										<Label for="created" class="font-light text-muted-foreground flex items-center gap-2"><CalendarCog class="w-8 h-8"/> Created</Label>
										<p class="text-sm font-semibold" id="created">{tag.metadata.created}</p>
										<Separator class="col-span-2" />
										<Label for="dockerVersion" class="font-light text-muted-foreground flex items-center gap-2"><GalleryHorizontalEnd class="w-8 h-8"/> Docker Version</Label>
										<p class="text-sm font-semibold" id="dockerVersion">{tag.metadata.dockerVersion}</p>
										{#if tag.metadata.author}
											<Separator class="col-span-2" />
											<Label for="author" class="font-light text-muted-foreground flex items-center gap-2"><UserPen class="w-8 h-8"/> Author</Label>
											<p class="text-sm font-semibold" id="author">{tag.metadata.author}</p>
										{/if}
										<Separator class="col-span-2" />
									</div>
								</div>
							{/if}
							<Sheet.Footer>
								<Sheet.Close class="{buttonVariants({ variant: 'outline' })} border-solid border-rose-600">
									Delete
								</Sheet.Close>
							</Sheet.Footer>
						</Sheet.Content>
					</Sheet.Root>
				{/if}
			{/each}
		</CollapsibleCard>
	{/each}
</div>
