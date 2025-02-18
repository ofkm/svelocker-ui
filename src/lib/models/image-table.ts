import type { RepoImage } from '$lib/models/image.ts';
import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import TagDropdownActions from '$lib/components/image-table/tag-dropdown-actions.svelte';

// Extend RepoImage type to include the new properties
type ExtendedRepoImage = RepoImage & {
	repo: string;
	repoIndex: number;
};

export const columns: ColumnDef<ExtendedRepoImage>[] = [
	{
		accessorKey: 'name',
		header: 'Image Name'
	},
	{
		accessorKey: 'fullName',
		header: 'Full Name'
	},
	{
		id: 'actions',
		header: 'Tags',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(TagDropdownActions, {
				tags: row.original.tags,
				repo: row.original.repo,
				repoIndex: row.original.repoIndex,
				data: row.original
			});
		}
	}
];
