<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { ImageTag } from '$lib/models/tag.ts';

	let { tags }: { tags: ImageTag[] } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Tags</DropdownMenu.GroupHeading>
			<DropdownMenu.Item onclick={() => navigator.clipboard.writeText(tags[0].name)}>Copy payment ID</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Tag 1</DropdownMenu.Item>
		<DropdownMenu.Item>Tag 2</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
