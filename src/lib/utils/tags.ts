import axios from 'axios';
import type { ImageTag } from '$lib/models/tag.ts';
import type { RepoImage } from '$lib/models/image.ts';
import { fetchDockerMetadataAxios } from '$lib/utils/manifest.ts';
import { env } from '$env/dynamic/public';
import { Buffer } from 'buffer';

export async function getDockerTagsNew(registryUrl: string, repo: string): Promise<RepoImage> {
	let tags: ImageTag[] = [];
	let data: { name: string; tags: string[] } = { name: '', tags: [] };

	try {
		const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');

		const response = await axios.get(`${registryUrl}/v2/${repo}/tags/list`, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: 'application/json'
			}
		});

		data = await response.data;

		if (data.tags) {
			tags = await Promise.all(
				data.tags.map(async (tag) => {
					const metadata = await fetchDockerMetadataAxios(registryUrl, repo, tag);
					return { name: tag, metadata };
				})
			);
		}
	} catch (error) {
		console.error('Error fetching repo images:', error);
		return {
			name: data.name,
			fullName: repo,
			tags: []
		};
	}
	return {
		name: data.name,
		fullName: repo,
		tags
	};
}
