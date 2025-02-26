// src/lib/services/db/types.ts

// Database records (raw database format)
export interface RepositoryRecord {
	id: number;
	name: string;
	last_synced: string;
}

export interface ImageRecord {
	id: number;
	repository_id: number;
	name: string;
	fullName: string;
	pull_count: number;
}

export interface TagRecord {
	id: number;
	image_id: number;
	name: string;
	digest: string;
}

// Application models (processed format)
export interface Repository {
	id: number;
	name: string;
	lastSynced: Date;
}

export interface Image {
	id: number;
	repositoryId: number;
	name: string;
	fullName: string;
	pullCount: number;
}

export interface Tag {
	id: number;
	imageId: number;
	name: string;
	digest: string;
}

export interface TagMetadata {
	created?: string | null;
	os?: string | null;
	architecture?: string | null;
	author?: string | null;
	dockerFile?: string | null;
	exposedPorts?: string[] | null;
	totalSize?: number | null;
	workDir?: string | null;
	command?: string | string[] | null;
	description?: string | null;
	contentDigest?: string | null;
	entrypoint?: string | string[] | null;
	isOCI?: boolean | null;
	indexDigest?: string | null;
}

export interface TagWithMetadata extends Tag {
	metadata: TagMetadata;
}
