/**
 * API response types for registry data
 */
import type { TagMetadata } from '../db/models';

export interface ImageTag {
	name: string;
	metadata?: TagMetadata;
}

export interface RepoImage {
	name: string;
	fullName: string;
	tags: ImageTag[];
}

export interface RegistryRepo {
	id: string;
	name: string;
	lastSynced?: string | Date;
	images: RepoImage[];
}

export interface RegistryRepos {
	repositories: RegistryRepo[];
}
