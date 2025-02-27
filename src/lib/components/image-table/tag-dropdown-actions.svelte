<script lang="ts">
	import { Tag, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { ImageTag } from '$lib/models/tag.ts';
	import { derived } from 'svelte/store';
	import { readable, writable } from 'svelte/store';
	import type { RegistryRepo } from '$lib/models/repo';

	let {
		tags,
		data,
		imageFullName,
		imageName
	}: {
		tags: ImageTag[];
		data: RegistryRepo[];
		imageFullName: string;
		imageName: string;
	} = $props();

	const tagsStore = readable(tags);

	// Pagination state
	const TAGS_PER_PAGE = 3;
	const currentPage = writable(1);

	// Sort tags reactively to keep 'latest' at the top
	const sortedTags = derived(tagsStore, ($tags) => {
		return [...$tags].sort((a, b) => {
			if (a.name === 'latest') return -1;
			if (b.name === 'latest') return 1;
			return a.name.localeCompare(b.name);
		});
	});

	// Calculate total pages
	const totalPages = derived(sortedTags, ($sortedTags) => {
		return Math.ceil($sortedTags.length / TAGS_PER_PAGE);
	});

	// Get current page of tags
	const paginatedTags = derived([sortedTags, currentPage], ([$sortedTags, $currentPage]) => {
		const startIndex = ($currentPage - 1) * TAGS_PER_PAGE;
		return $sortedTags.slice(startIndex, startIndex + TAGS_PER_PAGE);
	});

	function nextPage() {
		currentPage.update((p) => Math.min(p + 1, $totalPages));
	}

	function prevPage() {
		currentPage.update((p) => Math.max(p - 1, 1));
	}

	// Generate a unique ID for this dropdown
	const dropdownId = `tag-dropdown-${imageFullName.replace(/[^\w]/g, '-')}`;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button data-testid={`tag-dropdown-${imageName}`} data-dropdown-id={dropdownId} variant="ghost" size="icon" class="relative size-8 p-0">
			<span class="sr-only">Open menu</span>
			<Tag />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content data-testid={`dropdown-content-${imageName}`}>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading class="font-bold flex items-center justify-center">
				Tags {#if $sortedTags.length > TAGS_PER_PAGE}({$currentPage}/{$totalPages}){/if}
			</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />

			{#each $paginatedTags as tag}
				<DropdownMenu.Item role="menuitem" class="font-bold flex items-center justify-center">
					<a href="/details/{imageFullName.includes('/') ? imageFullName : `library/${imageFullName}`}/{tag.name}" class={tag.name === 'latest' ? 'text-green-400' : ''}>
						{tag.name}
					</a>
				</DropdownMenu.Item>
			{/each}

			{#if $sortedTags.length > TAGS_PER_PAGE}
				<DropdownMenu.Separator />
				<div class="flex justify-between px-2 py-1">
					<Button variant="ghost" size="icon" class="h-7 w-7" disabled={$currentPage === 1} onclick={prevPage}>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					<span class="text-xs flex items-center">
						Page {$currentPage} of {$totalPages}
					</span>
					<Button variant="ghost" size="icon" class="h-7 w-7" disabled={$currentPage === $totalPages} onclick={nextPage}>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			{/if}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
