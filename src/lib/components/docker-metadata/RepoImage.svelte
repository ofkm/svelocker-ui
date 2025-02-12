<script lang="ts">

import { buttonVariants } from '$lib/components/ui/button';
import { Separator } from '$lib/components/ui/separator';
import { AppWindowMac, CalendarCog, CircuitBoard, GalleryHorizontalEnd, UserPen } from 'lucide-svelte';
import { Label } from '$lib/components/ui/label';
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import * as Sheet from "$lib/components/ui/sheet";
import type { ImageTag } from '$lib/models/tag.ts';
import { getDockerTagsNew } from '$lib/utils/tags.ts'

let tagsArray: ImageTag[] = [];

export let repo;

getDockerTagsNew('https://kmcr.cc', repo)
	.then((repoImage) =>  {
		tagsArray = repoImage.tags
	})
	.catch((error) => console.error("Error fetching repo images:", error));

</script>

{#each tagsArray as tag}
	<!--{#each repoSpecificRun(repo.name) as tag}-->
	{#if tag.name === "latest"}
		<Sheet.Root>
			<Sheet.Trigger class="{buttonVariants({ variant: 'outline' })} badgeLinkLatest text-center border-solid">
				{tag.name}
			</Sheet.Trigger>
			<Sheet.Content side="right">
				<Sheet.Header>
					<Sheet.Title>{repo}:{tag.name}</Sheet.Title>
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