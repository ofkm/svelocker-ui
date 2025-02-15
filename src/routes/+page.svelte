<script lang="ts">
	import RepoCard from '$lib/components/RepoCard.svelte';
	import { writable, derived } from "svelte/store";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import type { PageProps } from './$types';
	import { env } from '$env/dynamic/public'

	let { data }: PageProps = $props();

	// Constants
	const ITEMS_PER_PAGE = 5;
	let currentPage = $state(writable(1)); // 🔹 Use `const`, not `let`
	const totalPages = Math.ceil(data.repos.repositories.length / ITEMS_PER_PAGE);

	// Compute paginated data
	const paginatedData = derived(currentPage, ($currentPage) =>
		data.repos.repositories.slice(($currentPage - 1) * ITEMS_PER_PAGE, $currentPage * ITEMS_PER_PAGE)
	);

	// Functions to update pages safely
	function prevPage() {
		currentPage.update(n => Math.max(1, n - 1));
	}

	function nextPage() {
		currentPage.update(n => Math.min(totalPages, n + 1));
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage.set(page);
		}
	}
</script>

<svelte:head>
	<title>Svelocker UI</title>
</svelte:head>

<div class="flex-1 w-full flex-col justify-between bg-slate-900/70">
	{#if data.repos.repositories.length > 0}

		<h2 class="text-white text-2xl pl-10 pt-10">Found {data.repos.repositories.length} Images for {env.PUBLIC_REGISTRY_NAME}</h2>
		<!-- RepoCard List -->
		<div class="grid grid-cols-1 gap-4" style="margin-bottom: 2em;">
			<RepoCard filteredData={$paginatedData} data={data} />
		</div>

		<!-- Pagination Component -->
		<Pagination.Root count={data.repos.repositories.length} perPage={ITEMS_PER_PAGE} class="sticky-bottom-0 z-10 pagination-footer ">
			{#snippet children({ pages })}
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton onclick={prevPage} />
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === "ellipsis"}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item isVisible={$currentPage === page.value}>
								<Pagination.Link {page} isActive={$currentPage === page.value} onclick={() => goToPage(page.value)}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton onclick={nextPage} />
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	{:else}
		<div class="grid grid-cols-1 gap-4 p-10">
			<h2 class="text-lg poppins">Could not pull registry data...</h2>
		</div>
	{/if}
</div>
