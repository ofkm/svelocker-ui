import type { ImageTag } from '$lib/models/tag.ts';

export type RepoImage = {
	name: string;
	tags: ImageTag[];
};
