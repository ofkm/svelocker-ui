<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { AppWindowMac, Trash2, CalendarCog, CircuitBoard, UserPen, EthernetPort, Slash, Scaling, Terminal, FolderCode, Home, Copy, ArrowLeft, RefreshCw } from '@lucide/svelte';
	import { convertTimeString } from '$lib/utils/formatting';
	import MetadataItem from '$lib/components/docker-metadata/MetadataItem.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.ts';
	import type { PageData } from './$types';
	import { toast } from 'svelte-sonner';
	import { env } from '$env/dynamic/public';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { onMount } from 'svelte';
	import { copyDockerRunCommand } from '$lib/utils/ui';
	import LayerVisualization from '$lib/components/docker-metadata/LayerVisualization.svelte';
	import DockerfileEditor from '$lib/components/docker-metadata/DockerFileViewer.svelte';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import type { Tag, TagMetadata, ImageLayer } from '$lib/types/tag-type';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Extract data from the page server with proper type casting
	let tag = $derived((data.tag as Tag) || ({} as Tag));
	let repoName = $derived(data.repoName || '');
	let imageName = $derived(data.imageName || '');
	let tagName = $derived(data.tagName || '');
	let imageFullName = $derived(`${repoName}/${imageName}`);

	// Extract tag metadata with proper typing
	let metadata = $derived((tag?.metadata as TagMetadata) || ({} as TagMetadata));
	let loadError = $state(false);
	let errorMessage = $state('');
	let stickyLineNumbers = $state(true);
	const baseUrl = env.PUBLIC_BACKEND_URL || 'http://localhost:8080';

	// Check if this is the latest tag
	let isLatest = $derived(tagName === 'latest');

	onMount(async () => {
		console.log('Page mounted with data:', data);
		console.log('Tag data:', tag);
		console.log('Tag metadata:', metadata);

		if (!metadata || Object.keys(metadata).length === 0) {
			try {
				console.warn('Tag metadata appears to be empty');
			} catch (error) {
				loadError = true;
				errorMessage = error instanceof Error ? error.message : 'Failed to load tag details';
			}
		}
	});

	onMount(() => {
		console.log('Full tag data:', tag);
		console.log('Metadata:', metadata);
		console.log('Author:', metadata?.author);
		console.log('Layers:', metadata?.layers);
	});

	async function deleteTagBackend(name: string, digest: string) {
		if (!digest) {
			toast.error('Error Deleting Docker Tag', {
				description: 'No digest found for this tag'
			});
			return;
		}

		try {
			const response = await fetch(`${baseUrl}/api/delete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					registryUrl: env.PUBLIC_REGISTRY_URL,
					repo: name,
					digest: digest,
					manifestType: metadata?.isOCI ? 'application/vnd.oci.image.index.v1+json' : 'application/vnd.docker.distribution.manifest.v2+json'
				})
			});

			const result = await response.json();
			if (result.success) {
				toast.success('Docker Tag Deleted Successfully', {
					description: result.message || 'Run `registry garbage-collect /etc/docker/registry/config.yml` to cleanup. Refreshing...'
				});
				setTimeout(() => (window.location.href = '/'), 3000);
			} else {
				toast.error('Error Deleting Docker Tag', {
					description: result.error || 'Check your Registry configuration.'
				});
			}
		} catch (error) {
			toast.error('Error Deleting Docker Tag', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred'
			});
		}
	}

	// For display in the UI, show just the image name without repo
	let displayImageName = $derived(imageName.includes('/') ? imageName.split('/').pop() || '' : imageName);

	// Format the exposed ports for display
	function formatExposedPorts(ports: string | Record<string, any> | undefined): string {
		if (!ports) return 'None';

		if (typeof ports === 'string') {
			return ports;
		}

		if (typeof ports === 'object') {
			return Object.keys(ports).join(', ');
		}

		return 'None';
	}

	// Format commands and entrypoints for display
	function formatArrayValue(value: string | string[] | undefined): string {
		if (!value) return 'None';

		if (Array.isArray(value)) {
			return value.join(' ');
		}

		if (typeof value === 'object') {
			return JSON.stringify(value);
		}

		return value || 'None';
	}
</script>

<svelte:head>
	<title>Svelocker UI - {imageFullName}:{tagName}</title>
</svelte:head>

{#if loadError}
	<div class="mx-auto py-6 flex-1 w-full max-w-[95%]">
		<div class="p-6 border border-red-300 rounded-lg bg-red-50/90 dark:bg-red-900/20 dark:border-red-800 shadow-sm">
			<h2 class="text-lg font-medium text-red-800 dark:text-red-300">Failed to load image details</h2>
			<p class="mt-2 text-sm text-red-700 dark:text-red-400">{errorMessage || 'There was an error loading the image details. This might be due to an issue with the crypto module or with accessing the manifest.'}</p>
			<div class="mt-4 flex gap-3">
				<Button variant="outline" class="gap-2" onclick={() => window.location.reload()}>
					<RefreshCw class="h-4 w-4" />
					Try Again
				</Button>
				<Button variant="outline" class="gap-2" onclick={() => (window.location.href = '/')}>
					<ArrowLeft class="h-4 w-4" />
					Go Back to Home
				</Button>
			</div>
		</div>
	</div>
{:else}
	<!-- Use the same height approach as the main page -->
	<div class="mx-auto py-6 flex-1 w-full flex-col bg-background">
		<div class="flex-1 w-full flex-col justify-between max-w-[95%] mx-auto">
			<!-- Breadcrumb Navigation -->
			<div class="bg-card/30 border border-border/40 rounded-lg p-2 backdrop-blur-sm mb-4">
				<Breadcrumb.Root>
					<Breadcrumb.List class="py-1">
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/" class="text-muted-foreground hover:text-foreground transition-colors">
								<Home class="h-4 w-4 mr-1 inline-flex" />
								<span>Home</span>
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator>
							<Slash class="h-4 w-4" />
						</Breadcrumb.Separator>
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/details/{repoName}" class="text-muted-foreground hover:text-foreground transition-colors">
								{repoName}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator>
							<Slash class="h-4 w-4" />
						</Breadcrumb.Separator>
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/details/{repoName}/{imageName}" class="text-muted-foreground hover:text-foreground transition-colors">
								{displayImageName}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator>
							<Slash class="h-4 w-4" />
						</Breadcrumb.Separator>
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/details/{repoName}/{imageName}/{tagName}" class="text-foreground font-medium">
								{tagName}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>

			<!-- Header Section - Match main page header style -->
			<div class="mb-6 bg-card/90 backdrop-blur-sm rounded-xl shadow-sm border border-border/60 p-4">
				<div class="flex flex-col md:flex-row justify-between items-start gap-4">
					<div>
						<h1 data-testid="image-details-header" class="text-2xl font-semibold tracking-tight flex items-center flex-wrap gap-2">
							<span>{imageFullName}:{tagName}</span>
							{#if isLatest}
								<div class="inline-flex items-center h-[1.5em] overflow-hidden rounded-full border border-green-400/50 bg-green-50/50 dark:bg-green-900/20 dark:border-green-800/50">
									<div class="px-3 flex items-center h-full">
										<span class="text-xs font-medium text-green-600 dark:text-green-400">Latest Version</span>
									</div>
								</div>
							{/if}
						</h1>

						{#if metadata?.description}
							<p class="mt-1 text-sm text-muted-foreground">{metadata.description}</p>
						{/if}

						{#if tag?.digest}
							<div class="flex items-center mt-3 bg-muted/30 rounded-md overflow-hidden max-w-full">
								<div class="flex-shrink-0 bg-primary/10 border border-secondary rounded-l-md px-3 py-1.5">
									<span class="text-xs font-medium text-primary font-mono">digest</span>
								</div>
								<div class="px-3 py-1.5 overflow-hidden text-ellipsis whitespace-nowrap w-full">
									<p class="text-xs text-muted-foreground font-mono truncate">{tag.digest}</p>
								</div>
							</div>
						{/if}
					</div>
					<div class="flex gap-2 mt-2 md:mt-0">
						<Button variant="outline" size="sm" class="gap-2" onclick={() => copyDockerRunCommand(imageFullName, tagName, env.PUBLIC_REGISTRY_URL)}>
							<Terminal class="h-4 w-4" />
							Copy Docker Run
						</Button>

						<AlertDialog.Root>
							<AlertDialog.Trigger class="{buttonVariants({ variant: 'destructive', size: 'sm' })} gap-2">
								<Trash2 class="h-4 w-4" /> Delete Tag
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title class="font-light text-md">Are you sure you want to delete the following tag?<br /><span class="font-bold underline">{imageFullName}:{tagName}</span></AlertDialog.Title>
									<AlertDialog.Description>This action <span class="font-extrabold">CAN NOT</span> be undone. <br /><span class="font-bold">All tags with the same config digest will be deleted.</span></AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										onclick={() => {
											const digest = tag?.digest;
											console.log('Selected digest:', digest);

											if (!digest) {
												toast.error('Error Deleting Docker Tag', {
													description: 'No digest found for this tag'
												});
												return;
											}

											// Strip 'library/' prefix if present
											const name = imageFullName.startsWith('library/') ? imageFullName.replace('library/', '') : imageFullName;

											deleteTagBackend(name, digest);
										}}
										class={buttonVariants({ variant: 'destructive' })}
									>
										Delete
									</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</div>
				</div>
			</div>

			<!-- Main Content Grid -->
			<div class="grid lg:grid-cols-2 gap-6 h-[calc(100vh-290px)]">
				<!-- Left Column: Metadata -->
				{#if metadata && Object.keys(metadata).length > 0}
					<div class="bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm overflow-hidden flex flex-col">
						<div class="border-b backdrop-blur-sm p-3 bg-card/80 flex-shrink-0">
							<h2 class="text-lg font-semibold">Image Metadata</h2>
							<p class="text-xs text-muted-foreground">Technical details for {imageFullName}:{tagName}</p>
						</div>

						<div class="p-4 overflow-auto flex-grow">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<MetadataItem label="OS" icon={AppWindowMac} value={metadata?.os || 'Unknown'} />
								<MetadataItem label="Architecture" icon={CircuitBoard} value={metadata?.architecture || 'Unknown'} />
								<MetadataItem label="Created" icon={CalendarCog} value={metadata?.created ? convertTimeString(metadata.created) : 'Unknown'} />
								<MetadataItem label="Author" icon={UserPen} value={metadata?.author || 'Unknown'} />
								<MetadataItem label="Exposed Ports" icon={EthernetPort} value={formatExposedPorts(metadata?.exposedPorts)} />
								<MetadataItem label="Container Size" icon={Scaling} value={metadata?.totalSize ? `${(metadata.totalSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'} />
								<MetadataItem label="Working Directory" icon={FolderCode} value={metadata?.workDir || '/'} />
								<MetadataItem label="Command" icon={Terminal} value={formatArrayValue(metadata?.command)} />
								<MetadataItem label="Entrypoint" icon={Terminal} value={formatArrayValue(metadata?.entrypoint)} />
							</div>
						</div>
					</div>
				{/if}

				<!-- Right Column: Dockerfile with full height -->
				<div class="bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
					<div class="border-b backdrop-blur-sm flex justify-between items-center p-3 bg-card/80 flex-shrink-0">
						<div>
							<h2 class="text-lg font-semibold">Dockerfile</h2>
							<p class="text-xs text-muted-foreground">Viewing Dockerfile for {imageFullName}:{tagName}</p>
						</div>

						<!-- Sticky Lines Switch -->
						<div class="flex items-center gap-2">
							<Label for="stickyLineSwitch">Sticky Line Numbers</Label>
							<Switch id="stickyLineSwitch" bind:checked={stickyLineNumbers} />
						</div>
					</div>

					<div class="flex-grow">
						<ScrollArea class="h-full w-full">
							<DockerfileEditor dockerfile={tag.metadata?.dockerFile || ''} theme="auto" showLineNumbers={true} {stickyLineNumbers} showCopyButton={true} />
						</ScrollArea>
					</div>
				</div>
			</div>

			<!-- Layer Visualization in Full Width Card -->
			{#if metadata?.layers && Array.isArray(metadata.layers) && metadata.layers.length > 0}
				<div class="mt-6 bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm overflow-hidden">
					<div class="border-b backdrop-blur-sm p-3 bg-card/80">
						<h2 class="text-lg font-semibold">Layer Composition</h2>
						<p class="text-xs text-muted-foreground">Size distribution of container image layers</p>
					</div>
					<div class="p-4">
						<LayerVisualization layers={metadata.layers} />
					</div>
				</div>
			{:else}
				<div class="mt-6 bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-4 text-center">
					<p class="text-muted-foreground">No layer information available for this image.</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
