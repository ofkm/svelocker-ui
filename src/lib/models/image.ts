import type { ImageTag } from '$lib/models/tag.ts';

export type RepoImage = {
	name: string; // image name without namespace
	fullName: string; // full image name with namespace
	tags: ImageTag[];
};
