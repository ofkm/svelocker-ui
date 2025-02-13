<script lang="ts">

	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { AppWindowMac, CalendarCog, CircuitBoard, UserPen, EthernetPort, Scaling } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Label } from '$lib/components/ui/label';
	import * as Drawer from '$lib/components/ui/drawer';
	import DockerfileDialog from '$lib/components/docker-metadata/ViewFileDialog.svelte';
	import { convertTimeString } from '$lib/utils/time.ts';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from '../../../routes/$types';

	export let data: PageData;
	export let repoIndex: number;
	export let tagIndex: number;
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
		<div class="mx-auto w-full max-w-[85%]">
			<Drawer.Header>
				<Drawer.Title>{repo}:{tag.name}
						{#if isLatest}
							<span class="pl-3"><Badge class="latestBadge" variant="outline">Latest Version</Badge></span>
						{/if}
				</Drawer.Title>
				<Drawer.Description>
					{#if tag.metadata}
						{tag.metadata.configDigest}
					{:else}
						No config Digest Found
					{/if}
					<Separator class="mt-3"/>
				</Drawer.Description>
			</Drawer.Header>
			{#if tag.metadata}
				<div class="pl-4 grid gap-4 py-4">
					<div class="grid col-auto grid-rows-3 grid-flow-col gap-4 items-center">
						<div class="">
							<Label for="os" class="font-light text-muted-foreground flex items-center gap-2 pb-2">
								<AppWindowMac class="w-5 h-5" /> OS
							</Label>
							<p class="text-sm font-semibold pb-2" id="os">{tag.metadata.os}</p>
						</div>
						<div>
							<Label for="arch" class="font-light text-muted-foreground flex items-center gap-2 pb-2">
								<CircuitBoard class="w-5 h-5" /> Arch
							</Label>
							<p class="text-sm font-semibold pb-2" id="arch">{tag.metadata.architecture}</p>
						</div>
						<div>
							<Label for="created" class="font-light text-muted-foreground flex items-center gap-2 pb-2">
								<CalendarCog class="w-5 h-5" /> Created
							</Label>
							<p class="text-sm font-semibold pb-2" id="created">{convertTimeString(tag.metadata.created)}</p>
						</div>
						<div>
							<Label for="exposedPorts" class="font-light text-muted-foreground flex items-center gap-2 pb-2">
								<EthernetPort class="w-5 h-5" /> Exposed Ports
							</Label>
									<p class="text-sm font-semibold pb-2" id="exposedPorts">{tag.metadata.exposedPorts}</p>
						</div>
						<div>
							<Label for="totalSize" class="font-light text-muted-foreground flex items-center gap-2 pb-2">
								<Scaling class="w-5 h-5" /> Container Size
							</Label>
							<p class="text-sm font-semibold pb-2" id="totalSize">{tag.metadata.totalSize}</p>
						</div>
						<div>
								<Label for="author" class="font-light text-muted-foreground flex items-center gap-2 pb-2">
									<UserPen class="w-5 h-5" /> Author
								</Label>
								<p class="text-sm font-semibold pb-2" id="author">{tag.metadata.author}</p>
						</div>
					</div>
				</div>
			{/if}
			<Drawer.Footer>
				<div class="grid gap-4 py-4">
					<div class="grid grid-col-2 grid-rows-1 grid-flow-col gap-4 items-center">
						<DockerfileDialog repoIndex={repoIndex} tagIndex={tagIndex} data={data} image={repo} tag={tag.name}/>
						<Drawer.Close disabled aria-label="Deleting Tags is not Implemented yet." class="{buttonVariants({ variant: 'destructive' })}">
							Delete Tag
						</Drawer.Close>
					</div>
				</div>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>