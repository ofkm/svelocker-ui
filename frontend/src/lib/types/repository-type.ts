import type { Image } from '$lib/types';

export interface Repository {
	ID?: number;
	CreatedAt?: string;
	UpdatedAt?: string;
	DeletedAt?: null | string;
	name: string;
	lastSynced: string;
	images?: Image[];
}

export interface RepositoryResponse {
	repositories: Repository[];
	totalCount: number;
	page: number;
	limit: number;
}
