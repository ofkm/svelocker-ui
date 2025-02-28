import type { RepoImage } from '$lib/models/image.ts';

export type RegistryRepo = {
	name: string; // namespace (e.g. "ofkm")
	lastSynced?: string | Date;
	images: RepoImage[]; // Array of images in this namespace
};
