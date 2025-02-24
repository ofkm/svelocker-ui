import axios from 'axios';
import type { ImageTag } from '$lib/models/tag.ts';
import type { RepoImage } from '$lib/models/image.ts';
import { fetchDockerMetadataAxios } from '$lib/utils/manifest.ts';
import { env } from '$env/dynamic/public';
import { Buffer } from 'buffer';
import { Logger } from '$lib/services/logger';

export async function getDockerTagsNew(registryUrl: string, repo: string): Promise<RepoImage> {
	const logger = Logger.getInstance('TagUtils');
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

		// Ensure we have a valid name from the repo path
		const name = data.name || repo.split('/').pop() || '';

		if (!name) {
			logger.error(`Invalid repository name for ${repo}`);
			throw new Error('Invalid repository name');
		}

		if (data.tags) {
			logger.info(`Found ${data.tags.length} tags for ${repo}`);
			tags = await Promise.all(
				data.tags.map(async (tag) => {
					try {
						const metadata = await fetchDockerMetadataAxios(registryUrl, repo, tag);
						return { name: tag, metadata };
					} catch (error) {
						logger.error(`Error fetching metadata for ${repo}:${tag}:`, error);
						return { name: tag, metadata: undefined };
					}
				})
			);
		}

		return {
			name: name,
			fullName: repo,
			tags
		};
	} catch (error) {
		logger.error('Error fetching repo images:', error);
		// Ensure we return a valid name even in error cases
		const fallbackName = repo.split('/').pop() || '';
		return {
			name: fallbackName,
			fullName: repo,
			tags: []
		};
	}
}
