<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import type { RegistryRepo } from '$lib/types/api/registry';
	import { columns } from '$lib/types/components/image-table';
	import { Database, Package2 } from 'lucide-svelte';

	export let repoIndex: number;
	export let filteredData: RegistryRepo[];

	// For debugging
	console.log('RepoImage: filteredData received:', filteredData);
	if (filteredData && filteredData[repoIndex]) {
		console.log('RepoImage: images for repository:', filteredData[repoIndex].images);
	}

	const table = createSvelteTable({
		get data() {
			if (!filteredData || !filteredData[repoIndex] || !filteredData[repoIndex].images) {
				console.warn('Missing or invalid data in RepoImage');
				return [];
			}

			const images = filteredData[repoIndex].images || [];
			console.log('Images being processed:', images);

			// Add repo and repoIndex to each image
			return images.map((image) => ({
				...image,
				repo: filteredData[repoIndex].name,
				repoIndex
			}));
		},
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	$: {
		if (filteredData && filteredData[repoIndex]) {
			console.log('Updating table options with data');
			table.setOptions((prev) => ({
				...prev,
				data:
					filteredData[repoIndex].images.map((image) => ({
						...image,
						repo: filteredData[repoIndex].name,
						repoIndex
					})) || []
			}));
		}
	}
</script>

<!-- Table Documentation: https://next.shadcn-svelte.com/docs/components/data-table  -->

{#if filteredData[repoIndex].images.length > 0}
	<div class="rounded-xl border shadow-sm bg-card overflow-hidden transition-all hover:border-border/80">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row class="bg-muted/20 hover:bg-muted/50 transition-colors">
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="font-medium text-muted-foreground">
								{#if !header.isPlaceholder}
									<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-testid="image-row-{row.original.name.replace(/[^\w]/g, '-')}" data-state={row.getIsSelected() && 'selected'} class="transition-colors hover:bg-muted/20 group">
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{:else}
	<div class="rounded-xl border bg-card/30 p-8 text-center shadow-sm backdrop-blur-sm transition-all">
		<div class="flex flex-col items-center justify-center space-y-3">
			<Package2 class="h-12 w-12 text-muted-foreground/40" />
			<p class="text-lg font-medium text-muted-foreground">No Images Found</p>
			<p class="text-sm text-muted-foreground/70">This repository doesn't have any images yet.</p>
		</div>
	</div>
{/if}
