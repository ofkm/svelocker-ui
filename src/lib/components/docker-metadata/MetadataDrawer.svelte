<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		AppWindowMac,
		CalendarCog,
		CircuitBoard,
		UserPen,
		EthernetPort,
		Scaling,
		Terminal,
		FolderCode
	} from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Drawer from '$lib/components/ui/drawer';
	import DockerfileDialog from '$lib/components/docker-metadata/ViewFileDialog.svelte';
	import { convertTimeString } from '$lib/utils/time.ts';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { deleteDockerManifestAxios } from '$lib/utils/delete.ts';
	import { env } from '$env/dynamic/public';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import type { RegistryRepo } from '$lib/models/repo.ts';
	import MetadataItem from './MetadataItem.svelte';

	export let data: RegistryRepo[];
	export let repoIndex: number;
	export let tagIndex: number;
	export let tag;
	export let repo;
	export let isLatest: boolean;

	async function deleteTag(name: string, tag: string, configDigest: string) {
		deleteDockerManifestAxios(env.PUBLIC_REGISTRY_URL, name, tag, configDigest).then((success) => {
			if (success) {
				toast.success('Docker Tag Deleted Successfully', {
					description:
						'Run `registry garbage-collect /etc/docker/registry/config.yml` to cleanup. Refreshing...'
				});
				setTimeout(() => location.reload(), 3000);
			} else {
				toast.error('Error Deleting Docker Tag', {
					description: 'Check your Registry configuration.'
				});
			}
		});
	}
</script>

<Drawer.Root>
	<Drawer.Trigger
		class="{buttonVariants({ variant: 'outline' })} {isLatest
			? 'badgeLinkLatest text-center border-solid w-20'
			: 'badgeLink text-center border-solid w-20'}"
	>
		{tag.name}
	</Drawer.Trigger>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-[85%]">
			<Drawer.Header>
				<Drawer.Title
					>{repo}:{tag.name}
					{#if isLatest}
						<span class="pl-3"
							><Badge class="latestBadge font-light" variant="outline">Latest Version</Badge></span
						>
					{/if}
				</Drawer.Title>
				<Drawer.Description>
					{#if tag.metadata}
						<span class="text-foreground mx-auto">{tag.metadata.description}</span><br />{tag
							.metadata.configDigest}
					{:else}
						No config Digest Found
					{/if}
					<Separator class="mt-3" />
				</Drawer.Description>
			</Drawer.Header>
			{#if tag.metadata}
				<div class="pl-4 grid gap-4 py-4">
					<div class="grid col-auto grid-rows-4 grid-flow-col gap-4 items-center">
						<MetadataItem label="OS" icon={AppWindowMac} value={tag.metadata.os} />
						<MetadataItem label="Arch" icon={CircuitBoard} value={tag.metadata.architecture} />
						<MetadataItem
							label="Created"
							icon={CalendarCog}
							value={convertTimeString(tag.metadata.created)}
						/>
						<MetadataItem label="Author" icon={UserPen} value={tag.metadata.author} />
						<MetadataItem
							label="Exposed Ports"
							icon={EthernetPort}
							value={tag.metadata.exposedPorts}
						/>
						<MetadataItem label="Container Size" icon={Scaling} value={tag.metadata.totalSize} />
						<MetadataItem
							label="Working Directory"
							icon={FolderCode}
							value={tag.metadata.workDir}
						/>
						<MetadataItem label="Command" icon={Terminal} value={tag.metadata.command} />
						<MetadataItem label="Entrypoint" icon={Terminal} value={tag.metadata.entrypoint} />
					</div>
				</div>
			{/if}
			<Drawer.Footer>
				<div class="grid gap-4 py-4">
					<div class="grid grid-col-2 grid-rows-1 grid-flow-col gap-4 items-center">
						<DockerfileDialog {repoIndex} {tagIndex} {data} image={repo} tag={tag.name} />
						<AlertDialog.Root>
							<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
								Delete Tag
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title class="font-light text-md"
										>Are you sure you want to delete the tag <span class="font-bold"
											>{repo}:{tag.name}</span
										>?</AlertDialog.Title
									>
									<AlertDialog.Description>
										This action cannot be undone. All tags with the same config digest will be
										deleted.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										onclick={() => deleteTag(repo, tag.name, tag.metadata.contentDigest)}
										class={buttonVariants({ variant: 'destructive' })}>Delete</AlertDialog.Action
									>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</div>
				</div>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
