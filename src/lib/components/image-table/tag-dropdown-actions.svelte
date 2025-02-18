<script lang="ts">
	import { Tag } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { ImageTag } from '$lib/models/tag.ts';
	import { derived } from 'svelte/store';
	import { readable } from 'svelte/store';
	import MetadataDrawer from '$lib/components/docker-metadata/MetadataDrawer.svelte';
	import type { RegistryRepo } from '$lib/models/repo';

	// let { tags }: { tags: ImageTag[] } = $props();
	let {
		tags,
		repo,
		repoIndex,
		data,
		imageFullName
	}: {
		tags: ImageTag[];
		repo: string;
		repoIndex: number;
		data: RegistryRepo[];
		imageFullName: string;
	} = $props();

	const dataStore = readable(data);
	const tagsStore = readable(tags);

	// Sort tags reactively to keep 'latest' at the top
	const sortedTags = derived(tagsStore, ($tags) => {
		return [...$tags].sort((a, b) => {
			if (a.name === 'latest') return -1;
			if (b.name === 'latest') return 1;
			return a.name.localeCompare(b.name);
		});
	});

	let isDropdownOpen = false;

	function handleTriggerClick(event: MouseEvent) {
		event.stopPropagation();
		console.log('clicked');
		isDropdownOpen = !isDropdownOpen;
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger onclick={handleTriggerClick}>
		<Button variant="ghost" size="icon" class="relative size-8 p-0">
			<span class="sr-only">Open menu</span>
			<Tag />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Tags</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			{#each $sortedTags as tag, tagIndex}
				<DropdownMenu.Item class="font-bold flex items-center justify-center ">
					<MetadataDrawer {tag} {repo} {repoIndex} {imageFullName} {tagIndex} data={$dataStore} isLatest={tag.name === 'latest'} />
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
