<script lang="ts">
	import { Tag } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { ImageTag } from '$lib/models/tag.ts';
	import { derived } from 'svelte/store';
	import { readable } from 'svelte/store';
	import type { RegistryRepo } from '$lib/models/repo';

	// let { tags }: { tags: ImageTag[] } = $props();
	let {
		tags,
		data,
		imageFullName,
		imageName
	}: {
		tags: ImageTag[];
		data: RegistryRepo[];
		imageFullName: string;
		imageName: string;
	} = $props();

	const tagsStore = readable(tags);

	// Sort tags reactively to keep 'latest' at the top
	const sortedTags = derived(tagsStore, ($tags) => {
		return [...$tags].sort((a, b) => {
			if (a.name === 'latest') return -1;
			if (b.name === 'latest') return 1;
			return a.name.localeCompare(b.name);
		});
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button data-testid="tag-button" variant="ghost" size="icon" class="relative size-8 p-0">
			<span class="sr-only">Open menu</span>
			<Tag />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content data-testid="dropdown-content">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading class="font-bold flex items-center justify-center">Tags</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			{#each $sortedTags as tag}
				<DropdownMenu.Item role="menuitem" class="font-bold flex items-center justify-center ">
					<a href="/details/{imageFullName}/{tag.name}" class={tag.name === 'latest' ? 'text-green-400' : ''}>
						{tag.name}
					</a>
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
