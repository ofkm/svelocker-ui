<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import DockerfileDialog from '$lib/components/docker-metadata/ViewFileDialog.svelte';
	import type { RegistryRepo } from '$lib/models/repo';

	let {
		repoIndex,
		data,
		repo
	}: {
		repoIndex: number;
		data: RegistryRepo[];
		repo: string;
		tag: { name: string };
	} = $props();
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
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item onclick={() => navigator.clipboard.writeText(id)}>Copy Dockerfile</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item><DockerfileDialog {repoIndex} {tagIndex} {data} image={repo} tag={tag?.name} /></DropdownMenu.Item>
		<DropdownMenu.Item>Delete Image</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
