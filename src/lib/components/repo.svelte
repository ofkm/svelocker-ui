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

	// getImageTags('https://kmcr.cc/v2/ofkm/caddy/tags/list')
	// 	.then((repoImage) =>  {
	// 			tagsArray = repoImage.tags
	// 	})
	// 	.catch((error) => console.error("Error fetching repo images:", error));

	getDockerTagsNew('https://kmcr.cc', 'ofkm/caddy')
		.then((repoImage) =>  {
			tagsArray = repoImage.tags
		})
		.catch((error) => console.error("Error fetching repo images:", error));

</script>

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 p-10">
		{#each repos as repo}
		<CollapsibleCard id={repo.name} title={repo.name}>
			{#each tagsArray as tag}
				{#if tag.name === "latest"}
					<Sheet.Root>
						<Sheet.Trigger class="{badgeVariants({ variant: 'secondary' })} badgeLinkLatest">
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
									<Separator class="col-span-2" />
									{#if tag.metadata.author}
									<Label for="author" class="font-light text-muted-foreground flex items-center gap-2"><UserPen class="w-8 h-8"/> Author</Label>
									<p class="text-sm font-semibold" id="author">{tag.metadata.author}</p>
<!--									//make if statment if no author is found-->
										<Separator class="col-span-2" />
									{/if}
								</div>
							</div>
							{/if}
							<Sheet.Footer>
								<Sheet.Close class={buttonVariants({ variant: "outline" })}>
									Delete
								</Sheet.Close>
							</Sheet.Footer>
						</Sheet.Content>
					</Sheet.Root>
				{:else}
					<Sheet.Root>
						<Sheet.Trigger class={buttonVariants({ variant: "secondary" })}>{tag.name}</Sheet.Trigger>
						<Sheet.Content side="right">
							<Sheet.Header>
								<Sheet.Title>Edit profile</Sheet.Title>
								<Sheet.Description>
									Make changes to your profile here. Click save when you're done.
								</Sheet.Description>
							</Sheet.Header>
							<div class="grid gap-4 py-4">
								<div class="grid grid-cols-4 items-center gap-4">
									<Label for="name" class="text-right">Name</Label>
									<Input id="name" value="Pedro Duarte" class="col-span-3" />
								</div>
								<div class="grid grid-cols-4 items-center gap-4">
									<Label for="username" class="text-right">Username</Label>
									<Input id="username" value="@peduarte" class="col-span-3" />
								</div>
							</div>
							<Sheet.Footer>
								<Sheet.Close class={buttonVariants({ variant: "outline" })}>
									Save changes
								</Sheet.Close>
							</Sheet.Footer>
						</Sheet.Content>
					</Sheet.Root>
				{/if}
			{/each}
		</CollapsibleCard>
	{/each}
</div>
