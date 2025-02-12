import type { ImageMetadata } from '$lib/models/metadata.ts';

export type ImageTag = {
	name: string;
	metadata?: ImageMetadata;
};