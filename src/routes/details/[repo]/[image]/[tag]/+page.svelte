<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { AppWindowMac, CalendarCog, CircuitBoard, UserPen, EthernetPort, Scaling, Terminal, FolderCode } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import DockerfileDialog from '$lib/components/docker-metadata/ViewFileDialog.svelte';
	import { convertTimeString } from '$lib/utils/time.ts';
	import { Badge } from '$lib/components/ui/badge';
	import MetadataItem from '$lib/components/docker-metadata/MetadataItem.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: currentTag = data.tag.tags[data.tagIndex];
</script>

<div class="mx-auto w-full max-w-[85%] p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold">
			{data.imageFullName}:{currentTag.name}
			{#if data.isLatest}
				<span class="pl-3"><Badge class="latestBadge font-light w-[80px] items-center justify-center" variant="outline">Latest Version</Badge></span>
			{/if}
		</h1>
		{#if currentTag.metadata}
			<p class="text-foreground mt-2">{currentTag.metadata.description}</p>
			<p class="text-sm text-muted-foreground">{currentTag.metadata.configDigest}</p>
		{:else}
			<p>No config Digest Found</p>
		{/if}
		<Separator class="mt-3" />
	</div>

	{#if currentTag?.metadata}
		<div class="grid gap-4 py-4">
			<div class="grid col-auto grid-rows-4 grid-flow-col gap-4 items-center">
				<MetadataItem label="OS" icon={AppWindowMac} value={currentTag.metadata.os} />
				<MetadataItem label="Arch" icon={CircuitBoard} value={currentTag.metadata.architecture} />
				<MetadataItem label="Created" icon={CalendarCog} value={convertTimeString(currentTag.metadata.created)} />
				<MetadataItem label="Author" icon={UserPen} value={currentTag.metadata.author} />
				<MetadataItem label="Exposed Ports" icon={EthernetPort} value={currentTag.metadata.exposedPorts} />
				<MetadataItem label="Container Size" icon={Scaling} value={currentTag.metadata.totalSize} />
				<MetadataItem label="Working Directory" icon={FolderCode} value={currentTag.metadata.workDir} />
				<MetadataItem label="Command" icon={Terminal} value={currentTag.metadata.command} />
				<MetadataItem label="Entrypoint" icon={Terminal} value={currentTag.metadata.entrypoint} />
			</div>
		</div>
	{/if}

	<div class="grid gap-4 py-4">
		<div class="grid grid-col-2 grid-rows-1 grid-flow-col gap-4 items-center">
			<DockerfileDialog image={data.imageFullName} tag={currentTag} />
		</div>
	</div>
</div>
