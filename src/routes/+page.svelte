<script lang="ts">
	import { writable, derived } from 'svelte/store';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Search, AlertCircle, RefreshCw, Database } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import { env } from '$env/dynamic/public';
	import SyncButton from '$lib/components/buttons/SyncButton.svelte';
	import type { RegistryRepo } from '$lib/models/repo';
	import { onMount } from 'svelte';
	import { lastSyncTimestamp, isSyncing } from '$lib/stores/sync-store';
	import RepositoryCard from '$lib/components/cards/RepositoryCard.svelte';

	let { data }: PageProps = $props();
	const isHealthy = data.healthStatus?.isHealthy;
	const searchQuery = writable('');

	// Store for loaded data
	const repositories = writable<RegistryRepo[]>([]);
	const isLoading = writable(true);
	const totalCount = writable(0); // Initialize with 0

	// Constants
	const ITEMS_PER_PAGE = 5;
	const currentPage = writable(1);

	// Load data from API based on current page and search
	async function loadPageData() {
		isLoading.set(true);
		try {
			const response = await fetch(`/api/repositories?page=${$currentPage}&limit=${ITEMS_PER_PAGE}&search=${$searchQuery}`);
			const data = await response.json();
			repositories.set(data.repositories);
			totalCount.set(data.totalCount);
		} catch (error) {
			console.error('Failed to load repositories:', error);
		} finally {
			isLoading.set(false);
		}
	}

	// Reactive values
	// const filteredData = $derived($repositories);
	// const totalPages = $derived(Math.ceil($totalCount / ITEMS_PER_PAGE));

	// Reactively compute total pages
	const totalPagesStore = derived(totalCount, ($totalCount) => {
		return Math.ceil($totalCount / ITEMS_PER_PAGE);
	});

	// Handle page navigation
	function prevPage() {
		currentPage.update((n) => Math.max(1, n - 1));
	}

	function nextPage() {
		currentPage.update((n) => Math.min($totalPagesStore, n + 1));
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= $totalPagesStore) {
			currentPage.set(page);
		}
	}

	// Reactively load data when page or search changes
	$effect(() => {
		if ($currentPage || $searchQuery !== undefined) {
			loadPageData();
		}
	});

	// Listen for sync completion and reload data
	$effect(() => {
		if ($lastSyncTimestamp) {
			console.log('Sync completed, refreshing data...');
			loadPageData();
		}
	});

	// Initial data load
	onMount(() => {
		loadPageData();
	});
</script>

<svelte:head>
	<title>Svelocker UI</title>
</svelte:head>

<div class="mx-auto w-full flex-col bg-background">
	{#if data.error}
		<div class="flex items-center mx-10 gap-3 p-4 border rounded-xl shadow-sm bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 transition-all">
			<AlertCircle size={20} class="text-red-600 dark:text-red-400 flex-shrink-0" />
			<p class="text-red-600 dark:text-red-400 font-medium">Unable to connect to registry at {env.PUBLIC_REGISTRY_URL}. Please check your connection and registry status.</p>
		</div>
	{/if}

	<div class="w-full flex-col justify-between max-w-[95%] mx-auto pt-5 pb-5">
		<!-- Header with Glassmorphism effect -->
		<div class="mb-8 bg-card/90 backdrop-blur-sm rounded-xl shadow-sm border border-border/60 p-6 mx-10">
			<div class="flex flex-col md:flex-row justify-between items-start gap-6">
				<div class="space-y-3">
					<h2 class="text-3xl font-semibold tracking-tight">
						<span class="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{$totalCount}</span>
						<span class="font-medium">{$totalCount === 1 ? 'Repository' : 'Repositories'}</span>
						<span class="text-muted-foreground text-xl ml-1">in {env.PUBLIC_REGISTRY_NAME}</span>
					</h2>
					{#if isHealthy !== undefined}
						<div class="flex items-center gap-2.5 bg-muted/40 rounded-full px-4 py-1.5 w-fit">
							<div class="w-2.5 h-2.5 rounded-full {isHealthy ? 'bg-green-500' : 'bg-red-500'} animate-pulse"></div>
							<span class="text-sm font-medium">
								Registry {isHealthy ? 'Healthy' : 'Unhealthy'}
							</span>
						</div>
					{/if}
				</div>
				<div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<SyncButton />
					<div class="relative w-full md:w-[280px]">
						<Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input type="search" placeholder="Search repositories..." class="pl-10 rounded-lg border-border/60 bg-background/80 focus-visible:ring-primary/30" bind:value={$searchQuery} />
					</div>
				</div>
			</div>
		</div>

		<!-- Content Section with Loading State -->
		{#if $isLoading}
			<div class="grid place-items-center h-[60vh]">
				<div class="text-center space-y-4">
					<div class="inline-block h-10 w-10 animate-spin rounded-full border-3 border-solid border-primary/80 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
					<p class="text-base text-muted-foreground">Loading repositories...</p>
				</div>
			</div>
		{:else if $repositories.length > 0}
			<!-- Repository Cards Grid Layout -->
			<div class="mx-10 mb-16">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each $repositories as repo}
						<RepositoryCard {repo} />
					{/each}
				</div>
			</div>

			<!-- Updated Pagination with Modern Floating Style -->
			{#if $repositories.length > 0 && $totalCount > ITEMS_PER_PAGE}
				<div class="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
					<div class="pointer-events-auto bg-background/80 backdrop-blur-lg shadow-lg border border-border/30 rounded-full px-4 py-2.5 transition-all duration-200 hover:bg-background/90">
						<Pagination.Root count={$totalCount} perPage={ITEMS_PER_PAGE}>
							{#snippet children({ pages })}
								<Pagination.Content class="flex items-center gap-1">
									<Pagination.Item>
										<Pagination.PrevButton onclick={prevPage} disabled={$isSyncing || $currentPage === 1} class="h-9 w-9 p-0 flex items-center justify-center rounded-full text-sm" />
									</Pagination.Item>

									{#each pages as page (page.key)}
										{#if page.type === 'ellipsis'}
											<Pagination.Item>
												<div class="flex items-center justify-center w-9 h-9">
													<Pagination.Ellipsis />
												</div>
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link {page} isActive={$currentPage === page.value} onclick={() => goToPage(page.value)} disabled={$isSyncing} class="h-9 w-9 p-0 flex items-center justify-center rounded-full text-sm {$currentPage === page.value ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}">
													{page.value}
												</Pagination.Link>
											</Pagination.Item>
										{/if}
									{/each}

									<Pagination.Item>
										<Pagination.NextButton onclick={nextPage} disabled={$isSyncing || $currentPage === $totalPagesStore} class="h-9 w-9 p-0 flex items-center justify-center rounded-full text-sm" />
									</Pagination.Item>
								</Pagination.Content>
							{/snippet}
						</Pagination.Root>
					</div>
				</div>
			{/if}
		{:else if $searchQuery}
			<!-- Empty Search Results with Enhanced Styling -->
			<div class="grid place-items-center h-[60vh]">
				<div class="text-center space-y-4 max-w-md mx-auto p-8 rounded-xl border bg-card/30 backdrop-blur-sm shadow-sm">
					<Search size={32} class="text-muted-foreground mx-auto opacity-50" />
					<h3 class="text-xl font-medium text-muted-foreground">No matches found for "<span class="text-foreground">{$searchQuery}</span>"</h3>
					<p class="text-sm text-muted-foreground/80 mt-2">Try adjusting your search terms or clear the search to see all repositories</p>
				</div>
			</div>
		{:else}
			<!-- Empty State with Enhanced Design -->
			<div class="grid place-items-center h-[60vh]">
				<div class="text-center space-y-4 max-w-md mx-auto p-8 rounded-xl border bg-card/30 backdrop-blur-sm shadow-sm">
					<Database size={48} class="mx-auto text-muted-foreground/40" />
					<h2 class="text-xl font-medium text-muted-foreground">No repositories found in registry</h2>
					<p class="text-sm text-muted-foreground/80">Registry is empty or still syncing data</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Syncing Indicator with Enhanced Animation -->
{#if $isSyncing}
	<div class="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-10 duration-300">
		<div class="flex items-center gap-3">
			<RefreshCw class="animate-spin h-5 w-5" />
			<span class="text-sm font-medium">Syncing registry...</span>
		</div>
	</div>
{/if}
