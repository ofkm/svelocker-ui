<script lang="ts">
	import MetadataDrawer from '$lib/components/docker-metadata/MetadataDrawer.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import type { RegistryRepo } from '$lib/models/repo.ts';
	import { columns } from '$lib/models/image-table.ts';

	export let repoIndex: number;
	export let filteredData: RegistryRepo[];

	// const table = createSvelteTable({
	// 	get data() {
	// 		return filteredData[repoIndex].images || [];
	// 	},
	// 	columns,
	// 	getCoreRowModel: getCoreRowModel()
	// });

	const table = createSvelteTable({
		get data() {
			const images = filteredData[repoIndex].images || [];
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

	// Watch for changes in filteredData
	// $: {
	// 	if (filteredData) {
	// 		table.setOptions((prev) => ({
	// 			...prev,
	// 			data: filteredData[repoIndex].images || []
	// 		}));
	// 	}
	// }

	$: {
		if (filteredData) {
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

<!-- TODO Implement Table here, and rewrite image/tag logic -->
{#if filteredData[repoIndex].images.length > 0}
	<!-- Create New For each loop for each image -- then put the below if statment inside of that -->
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
				<!-- {#each filteredData[repoIndex].images as image, imageIndex}{/each} -->
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

	<!-- {#each filteredData[repoIndex].images as tag, tagIndex}
		{#if tag.name === 'latest'}
			<MetadataDrawer {tag} repo={filteredData[repoIndex].name} {repoIndex} {tagIndex} isLatest={true} data={filteredData} />
		{:else}
			<MetadataDrawer {tag} repo={filteredData[repoIndex].name} {repoIndex} {tagIndex} isLatest={false} data={filteredData} />
		{/if}
	{/each} -->
{:else}
	<p class="text-lg font-light">No Tags Found.</p>
{/if}
