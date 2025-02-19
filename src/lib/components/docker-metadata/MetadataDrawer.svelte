<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { AppWindowMac, CalendarCog, CircuitBoard, UserPen, EthernetPort, Scaling, Terminal, FolderCode } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Drawer from '$lib/components/ui/drawer';
	import DockerfileDialog from '$lib/components/docker-metadata/ViewFileDialog.svelte';
	import { convertTimeString } from '$lib/utils/time.ts';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { deleteDockerManifestAxios } from '$lib/utils/delete.ts';
	import { env } from '$env/dynamic/public';

	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import type { RegistryRepo } from '$lib/models/repo.ts';
	import MetadataItem from './MetadataItem.svelte';
	import type { ImageTag } from '$lib/models/tag';

	export let data: RegistryRepo[];
	export let repoIndex: number;
	export let tagIndex: number;
	export let imageFullName: string;
	export let tag;
	export let repo;
	export let isLatest: boolean;

	$: safeData = Array.isArray(data) ? data : [];
	$: currentRepo = safeData[repoIndex] ?? null;

	let isOpen = false;

	function handleTriggerClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		isOpen = !isOpen;
	}

	function handleClose() {
		isOpen = false;
	}

	async function deleteTag(name: string, tag: string, configDigest: string) {
		deleteDockerManifestAxios(env.PUBLIC_REGISTRY_URL, name, tag, configDigest).then((success) => {
			if (success) {
				toast.success('Docker Tag Deleted Successfully', {
					description: 'Run `registry garbage-collect /etc/docker/registry/config.yml` to cleanup. Refreshing...'
				});
				setTimeout(() => location.reload(), 3000);
			} else {
				toast.error('Error Deleting Docker Tag', {
					description: 'Check your Registry configuration.'
				});
			}
		});
	}

	// Dockerfile Dialog
	let dialogOpen = false;
	//End dockerfile
</script>

<Drawer.Root open={isOpen} onOpenChange={handleClose}>
	<Drawer.Trigger onclick={handleTriggerClick} class="{buttonVariants({ variant: 'outline' })} {isLatest ? 'badgeLinkLatest w-20' : 'badgeLink w-20'} flex items-center justify-center">
		{tag.name}
	</Drawer.Trigger>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-[85%]">
			<Drawer.Header>
				<Drawer.Title
					>{imageFullName}:{tag.name}
					{#if isLatest}
						<span class="pl-3"><Badge class="latestBadge font-light w-[80px] items-center justify-center" variant="outline">Latest Version</Badge></span>
					{/if}
				</Drawer.Title>
				<Drawer.Description>
					{#if tag.metadata}
						<span class="text-foreground mx-auto">{tag.metadata.description}</span><br />{tag.metadata.configDigest}
					{:else}
						No config Digest Found
					{/if}
					<Separator class="mt-3" />
				</Drawer.Description>
			</Drawer.Header>
			{#if tag?.metadata}
				<div class="pl-4 grid gap-4 py-4">
					<div class="grid col-auto grid-rows-4 grid-flow-col gap-4 items-center">
						<MetadataItem label="OS" icon={AppWindowMac} value={tag.metadata.os} />
						<MetadataItem label="Arch" icon={CircuitBoard} value={tag.metadata.architecture} />
						<MetadataItem label="Created" icon={CalendarCog} value={convertTimeString(tag.metadata.created)} />
						<MetadataItem label="Author" icon={UserPen} value={tag.metadata.author} />
						<MetadataItem label="Exposed Ports" icon={EthernetPort} value={tag.metadata.exposedPorts} />
						<MetadataItem label="Container Size" icon={Scaling} value={tag.metadata.totalSize} />
						<MetadataItem label="Working Directory" icon={FolderCode} value={tag.metadata.workDir} />
						<MetadataItem label="Command" icon={Terminal} value={tag.metadata.command} />
						<MetadataItem label="Entrypoint" icon={Terminal} value={tag.metadata.entrypoint} />
					</div>
				</div>
			{/if}
			<Drawer.Footer>
				<div class="grid gap-4 py-4">
					<div class="grid grid-col-2 grid-rows-1 grid-flow-col gap-4 items-center">
						<Button variant="outline" class="dockerButtong" on:click={() => (dialogOpen = true)}>View Dockerfile</Button>
						<DockerfileDialog bind:open={dialogOpen} {repoIndex} {tagIndex} data={safeData} image={repo} tag={tag?.name} />
						<!-- <AlertDialog.Root>
							<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>Delete Tag</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title class="font-light text-md">Are you sure you want to delete the tag <span class="font-bold">{repo}:{tag.name}</span>?</AlertDialog.Title>
									<AlertDialog.Description>This action cannot be undone. All tags with the same config digest will be deleted.</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action onclick={() => deleteTag(repo, tag.name, tag.metadata.contentDigest)} class={buttonVariants({ variant: 'destructive' })}>Delete</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root> -->
					</div>
				</div>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
