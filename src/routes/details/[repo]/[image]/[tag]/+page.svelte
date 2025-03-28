<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { AppWindowMac, Trash2, CalendarCog, CircuitBoard, UserPen, EthernetPort, Slash, Scaling, Terminal, FolderCode, Home, Copy, ArrowLeft, RefreshCw } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { copyTextToClipboard } from '$lib/utils/ui';
	import { convertTimeString } from '$lib/utils/formatting';
	import { Badge } from '$lib/components/ui/badge';
	import MetadataItem from '$lib/components/docker-metadata/MetadataItem.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.ts';
	import type { PageData } from './$types';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { toast } from 'svelte-sonner';
	import { env } from '$env/dynamic/public';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { onMount, onDestroy } from 'svelte';
	import { copyDockerRunCommand } from '$lib/utils/ui';

	export let data: PageData;

	// Script content unchanged

	async function copyDockerfile() {
		if (!currentTag.metadata?.dockerFile) {
			toast.error('No Dockerfile available');
			return;
		}

		copyTextToClipboard(currentTag.metadata.dockerFile).then((success) => {
			if (success) {
				toast.success('Dockerfile Copied successfully');
			} else {
				toast.error('Failed to copy Dockerfile...');
			}
		});
	}

	$: currentTag = data.tag.tags[data.tagIndex];

	// Error handling
	let loadError = false;
	let errorMessage = '';

	onMount(async () => {
		if (currentTag && (!currentTag.metadata || Object.keys(currentTag.metadata).length === 0)) {
			try {
				console.warn('Tag metadata appears to be empty');
			} catch (error) {
				loadError = true;
				errorMessage = error instanceof Error ? error.message : 'Failed to load tag details';
			}
		}
	});

	async function deleteTagBackend(name: string, digest: string) {
		if (!digest) {
			toast.error('Error Deleting Docker Tag', {
				description: 'No digest found for this tag'
			});
			return;
		}

		try {
			const response = await fetch('/api/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					registryUrl: env.PUBLIC_REGISTRY_URL,
					repo: name,
					digest: digest,
					manifestType: currentTag.metadata?.isOCI ? 'application/vnd.oci.image.index.v1+json' : 'application/vnd.docker.distribution.manifest.v2+json'
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
</script>

<svelte:head>
	<title>Svelocker UI - {data.imageFullName}:{currentTag.name}</title>
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
						{#if data.repo !== 'library'}
							<Breadcrumb.Item>
								<Breadcrumb.Link href="/" class="text-muted-foreground hover:text-foreground transition-colors">
									{data.repo}
								</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator>
								<Slash class="h-4 w-4" />
							</Breadcrumb.Separator>
						{/if}
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/" class="text-muted-foreground hover:text-foreground transition-colors">
								{data.imageFullName.includes('/') ? data.imageFullName.split('/').pop() : data.imageFullName}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator>
							<Slash class="h-4 w-4" />
						</Breadcrumb.Separator>
						<Breadcrumb.Item>
							<Breadcrumb.Link class="text-foreground font-medium">
								{currentTag.name}
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
							<span>{data.imageFullName}:{currentTag.name}</span>
							{#if data.isLatest}
								<div class="inline-flex items-center h-[1.5em] overflow-hidden rounded-full border border-green-400/50 bg-green-50/50 dark:bg-green-900/20 dark:border-green-800/50">
									<div class="px-3 flex items-center h-full">
										<span class="text-xs font-medium text-green-600 dark:text-green-400">Latest Version</span>
									</div>
								</div>
							{/if}
						</h1>

						{#if currentTag.metadata?.description}
							<p class="mt-1 text-sm text-muted-foreground">{currentTag.metadata.description}</p>
						{/if}

						{#if currentTag.metadata?.indexDigest}
							<div class="flex items-center mt-3 bg-muted/30 rounded-md overflow-hidden max-w-full">
								<div class="flex-shrink-0 bg-primary/10 border border-secondary rounded-l-md px-3 py-1.5">
									<span class="text-xs font-medium text-primary/80 font-mono">digest</span>
								</div>
								<div class="px-3 py-1.5 overflow-hidden text-ellipsis whitespace-nowrap w-full">
									<p class="text-xs text-muted-foreground font-mono truncate">{currentTag.metadata.indexDigest}</p>
								</div>
							</div>
						{/if}
					</div>
					<div class="flex gap-2 mt-2 md:mt-0">
						<Button variant="outline" size="sm" class="gap-2" onclick={() => copyDockerRunCommand(data.imageFullName, currentTag.name, env.PUBLIC_REGISTRY_URL)}>
							<Terminal class="h-4 w-4" />
							Copy Docker Run
						</Button>

						<AlertDialog.Root>
							<AlertDialog.Trigger class="{buttonVariants({ variant: 'destructive', size: 'sm' })} gap-2">
								<Trash2 class="h-4 w-4" /> Delete Tag
							</AlertDialog.Trigger>
							<!-- Keep AlertDialog.Content content the same -->
						</AlertDialog.Root>
					</div>
				</div>
			</div>

			<!-- Main Content Grid -->
			<div class="grid lg:grid-cols-2 gap-6 h-[calc(100vh-290px)]">
				<!-- Left Column: Metadata -->
				{#if currentTag?.metadata}
					<div class="bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm overflow-hidden flex flex-col">
						<div class="border-b backdrop-blur-sm p-3 bg-card/80 flex-shrink-0">
							<h2 class="text-lg font-semibold">Image Metadata</h2>
							<p class="text-xs text-muted-foreground">Technical details for {data.imageFullName}:{currentTag.name}</p>
						</div>

						<div class="p-4 overflow-auto flex-grow">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<MetadataItem label="OS" icon={AppWindowMac} value={currentTag.metadata?.os || 'Unknown'} />
								<MetadataItem label="Architecture" icon={CircuitBoard} value={currentTag.metadata?.architecture || 'Unknown'} />
								<MetadataItem label="Created" icon={CalendarCog} value={currentTag.metadata?.created ? convertTimeString(currentTag.metadata.created) || 'Unknown' : 'Unknown'} />
								<MetadataItem label="Author" icon={UserPen} value={currentTag.metadata?.author || 'Unknown'} />
								<MetadataItem label="Exposed Ports" icon={EthernetPort} value={Array.isArray(currentTag.metadata?.exposedPorts) && currentTag.metadata.exposedPorts.length > 0 ? currentTag.metadata.exposedPorts.join(', ') : 'None'} />
								<MetadataItem label="Container Size" icon={Scaling} value={currentTag.metadata?.totalSize || 'Unknown'} />
								<MetadataItem label="Working Directory" icon={FolderCode} value={currentTag.metadata?.workDir || 'Unknown'} />
								<MetadataItem label="Command" icon={Terminal} value={typeof currentTag.metadata?.command === 'object' ? JSON.stringify(currentTag.metadata.command) : currentTag.metadata?.command || 'Unknown'} />
								<MetadataItem label="Entrypoint" icon={Terminal} value={typeof currentTag.metadata?.entrypoint === 'object' ? JSON.stringify(currentTag.metadata.entrypoint) : currentTag.metadata?.entrypoint || 'Unknown'} />
							</div>
						</div>
					</div>
				{/if}

				<!-- Right Column: Dockerfile with full height -->
				<div class="bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
					<div class="border-b backdrop-blur-sm flex justify-between items-center p-3 bg-card/80 flex-shrink-0">
						<div>
							<h2 class="text-lg font-semibold">Dockerfile</h2>
							<p class="text-xs text-muted-foreground">Viewing Dockerfile for {data.imageFullName}:{currentTag.name}</p>
						</div>
						<Button variant="outline" size="sm" class="gap-2" onclick={copyDockerfile}>
							<Copy class="h-4 w-4" />
							Copy Dockerfile
						</Button>
					</div>

					<!-- Dynamic height container for Dockerfile -->
					<div class="flex-grow overflow-hidden">
						<ScrollArea class="h-full">
							<div class="overflow-hidden h-full">
								<pre class="flex text-sm font-mono leading-relaxed h-full">
										<!-- Line numbers -->
										<div class="py-2 pl-2 pr-3 text-muted-foreground select-none border-r border-border/50 bg-muted/20 w-[3rem]">
											{#if currentTag.metadata?.dockerFile}
											{#each currentTag.metadata.dockerFile.split('\n') as _, i}
												<div class="text-right h-5 flex items-center justify-end px-1 text-xs">{i + 1}</div>
											{/each}
										{/if}
										</div>
										
										<!-- Code content -->
										<div class="py-2 px-3 bg-muted/10 w-full overflow-x-auto">
											{#if currentTag.metadata?.dockerFile}
											{#each currentTag.metadata.dockerFile.split('\n') as line}
												<div class="h-5 flex items-center text-xs">
														<span>{line}</span>
													</div>
											{/each}
										{:else}
											<div class="h-full flex items-center justify-center p-6 text-muted-foreground">
													<p>No Dockerfile content available for this image.</p>
												</div>
										{/if}
										</div>
									</pre>
							</div>
						</ScrollArea>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Styling for the scrollable areas */
	:global(.scrollarea-viewport) {
		border-radius: 0;
	}

	:global(.scrollbar) {
		padding-bottom: 5px;
	}

	:global(.scrollbar-thumb) {
		background-color: rgba(var(--primary-rgb), 0.2);
		border-radius: 9999px;
	}

	:global(.scrollbar-thumb:hover) {
		background-color: rgba(var(--primary-rgb), 0.3);
	}

	/* Add styles for the custom digest display */
	.bg-primary\/10 {
		background-color: rgba(var(--primary-rgb), 0.1);
	}

	.text-primary\/80 {
		color: rgba(var(--primary-rgb), 0.8);
	}
</style>
