<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import type { RegistryRepo } from '$lib/models/repo.ts';
	import { columns } from '$lib/models/image-table.ts';

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
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
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
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{:else}
	<p class="text-lg font-light">No Tags Found.</p>
{/if}
