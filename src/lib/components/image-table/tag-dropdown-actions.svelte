<script lang="ts">
	import { Tag } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { ImageTag } from '$lib/models/tag.ts';
	import { derived } from 'svelte/store';

	import { readable } from 'svelte/store';

	let { tags }: { tags: ImageTag[] } = $props();
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
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Tag />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Tags</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			{#each $sortedTags as tag}
				<DropdownMenu.Item class="font-bold">{tag.name}</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
