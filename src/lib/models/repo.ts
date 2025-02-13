import type { ImageTag } from '$lib/models/tag.ts';

export type RegistryRepo = {
	name: string;
	images: ImageTag[];
};
