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
		header: 'Image Name',
		accessorFn: (row) => {
			// Extract just the image name part
			if (row.name && row.name.includes('/')) {
				return row.name.split('/').pop();
			}
			return row.name;
		}
	},
	{
		accessorKey: 'fullName',
		header: 'Full Name'
	},
	{
		id: 'tags',
		header: 'Tags',
		cell: ({ row }) => {
			console.log('Rendering tag dropdown for row:', row.original);
			console.log('Tags data:', row.original.tags);

			return renderComponent(TagDropdownActions, {
				tags: row.original.tags || [],
				data: row.original,
				imageFullName: row.original.fullName,
				imageName: row.original.name.replace(/[^\w]/g, '-')
			});
		}
	}
];
