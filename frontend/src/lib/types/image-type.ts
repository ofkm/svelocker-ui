import type { Tag } from '$lib/types';

export interface Image {
	ID?: number;
	CreatedAt?: string;
	UpdatedAt?: string;
	DeletedAt?: null | string;
	repositoryId: number;
	name: string;
	fullName: string;
	pullCount: number;
	tags?: Tag[];
}
