export interface Tag {
	ID?: number;
	CreatedAt?: string;
	UpdatedAt?: string;
	DeletedAt?: null | string;
	imageId: number;
	name: string;
	digest: string;
	createdAt: string;
	metadata?: TagMetadata;
}

export interface TagMetadata {
	ID?: number;
	tagId: number;
	created: string;
	os: string;
	architecture: string;
	author: string;
	dockerFile?: string;
	configDigest?: string;
	exposedPorts?: string;
	totalSize: number;
	workDir?: string;
	command?: string;
	description?: string;
	contentDigest?: string;
	entrypoint?: string;
	indexDigest?: string;
	isOCI: boolean;
	layers?: ImageLayer[];
}

export interface ImageLayer {
	ID?: number;
	tagMetadataId: number;
	size: number;
	digest: string;
}
