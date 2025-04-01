import type { ImageLayer } from '$lib/types/api/manifest';

/**
 * Application model types (transformed from database records)
 */
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
	createdAt?: Date;
}

export interface TagMetadata {
	created: string;
	os: string;
	architecture: string;
	author: string;
	dockerFile: string;
	configDigest: string;
	exposedPorts: string[];
	totalSize: string;
	workDir: string;
	command: string;
	description: string;
	contentDigest: string;
	entrypoint: string;
	indexDigest: string;
	isOCI: boolean;
	layers: ImageLayer[];
}

export interface TagWithMetadata extends Tag {
	metadata?: TagMetadata;
}
