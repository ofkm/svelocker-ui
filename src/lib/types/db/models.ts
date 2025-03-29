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
	configDigest?: string;
	entrypoint?: string | string[] | null;
	isOCI?: boolean | null;
	indexDigest?: string | null;
}

export interface TagWithMetadata extends Tag {
	metadata?: TagMetadata;
}
