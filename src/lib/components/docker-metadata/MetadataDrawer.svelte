<script lang="ts">

	import { buttonVariants } from '$lib/components/ui/button';
	import { AppWindowMac, CalendarCog, CircuitBoard, UserPen } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Label } from '$lib/components/ui/label';
	import * as Drawer from '$lib/components/ui/drawer';

	export let tag;
	export let repo;
	export let isLatest: boolean;
</script>

<Drawer.Root>
	<Drawer.Trigger
		class="{buttonVariants({ variant: 'outline' })} {isLatest ? 'badgeLinkLatest text-center border-solid' : 'badgeLink text-center border-solid'}"
	>
		{tag.name}
	</Drawer.Trigger>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-2xl">
			<Drawer.Header>
				<Drawer.Title>{repo}:{tag.name}</Drawer.Title>
				<Drawer.Description>
					{#if tag.metadata}
						{tag.metadata.configDigest}
					{:else}
						No config Digest Found
					{/if}
				</Drawer.Description>
			</Drawer.Header>
			{#if tag.metadata}
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-2 gap-4 items-center">
						<Separator class="col-span-2" />
						<Label for="os" class="font-light text-muted-foreground flex items-center gap-2"
						><AppWindowMac width="16" height="16" /> OS</Label
						>
						<p class="text-sm font-semibold" id="os">{tag.metadata.os}</p>
						<Separator class="col-span-2" />
						<Label for="arch" class="font-light text-muted-foreground flex items-center gap-2"
						><CircuitBoard class="w-8 h-8" /> Arch</Label
						>
						<p class="text-sm font-semibold" id="arch">{tag.metadata.architecture}</p>
						<Separator class="col-span-2" />
						<Label for="created" class="font-light text-muted-foreground flex items-center gap-2"
						><CalendarCog class="w-8 h-8" /> Created</Label
						>
						<p class="text-sm font-semibold" id="created">{tag.metadata.created}</p>
						{#if tag.metadata.author}
							<Separator class="col-span-2" />
							<Label for="author" class="font-light text-muted-foreground flex items-center gap-2"
							><UserPen class="w-8 h-8" /> Author</Label
							>
							<p class="text-sm font-semibold" id="author">{tag.metadata.author}</p>
						{/if}
						<Separator class="col-span-2" />
					</div>
				</div>
			{/if}
			<Drawer.Footer>
				<Drawer.Close
					disabled
					class="{buttonVariants({ variant: 'outline' })} border-solid border-rose-600"
				>
					Delete
				</Drawer.Close>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>