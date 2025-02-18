import type { RepoImage } from '$lib/models/image.ts';
import type { ColumnDef } from '@tanstack/table-core';

export const columns: ColumnDef<RepoImage>[] = [
	{
		accessorKey: 'name',
		header: 'Image Name'
	},
	{
		accessorKey: 'fullname',
		header: 'Full Name'
	}
];
