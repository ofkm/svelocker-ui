/**
 * Raw database record types (as returned directly from database queries)
 */
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
	created_at: string;
}

export interface TagMetadataRecord {
	tag_id: number;
	created_at: string | null;
	os: string | null;
	architecture: string | null;
	author: string | null;
	dockerFile: string | null;
	exposedPorts: string | null;
	totalSize: number | null;
	workDir: string | null;
	command: string | null;
	description: string | null;
	contentDigest: string | null;
	entrypoint: string | null;
	isOCI: number | null;
	indexDigest: string | null;
}

/**
 * Combined record type for tag with its metadata
 * This represents the result of a JOIN query between tags and tag_metadata tables
 */
export interface TagWithMetadataRecord extends TagRecord {
	// Metadata fields from tag_metadata table
	os?: string | null;
	architecture?: string | null;
	author?: string | null;
	dockerFile?: string | null;
	exposedPorts?: string | null;
	totalSize?: number | null;
	workDir?: string | null;
	command?: string | null;
	description?: string | null;
	contentDigest?: string | null;
	entrypoint?: string | null;
	isOCI?: number | null;
	indexDigest?: string | null;
	layers?: string | null;
}

// Add user record type
export interface UserRecord {
	id: string;
	username: string;
	password_hash: string;
	email: string | null;
	name: string | null;
	is_admin: number;
	created_at: number;
}
