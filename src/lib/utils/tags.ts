import axios, { AxiosError } from 'axios';
import type { ImageTag } from '$lib/models/tag.ts';
import type { RepoImage } from '$lib/models/image.ts';
import { fetchDockerMetadataAxios } from '$lib/utils/manifest.ts';
import { Logger } from '$lib/services/logger';
import { getAuthHeaders } from '$lib/utils/api/auth';

/**
 * Extract repository name from full path
 */
function extractRepoName(fullRepoPath: string, defaultName: string = ''): string {
	return fullRepoPath.split('/').pop() || defaultName;
}

// Get tags with default limit (50)
// const repoWithDefaultLimit = await getDockerTagsNew(registryUrl, repo);

// // Get tags with custom limit
// const repoWithCustomLimit = await getDockerTagsNew(registryUrl, repo, 100);

// // Get only a few tags for a quick preview
// const repoPreview = await getDockerTagsNew(registryUrl, repo, 5);

/**
 * Fetches tags for a Docker repository with a limit on the number of tags returned
 * @param registryUrl Base URL of the registry
 * @param repo Repository name (or path)
 * @param limit Maximum number of tags to return (default: 50)
 * @returns Promise resolving to repository image data with tags
 */
export async function getDockerTagsNew(registryUrl: string, repo: string, limit: number = 50): Promise<RepoImage> {
	const logger = Logger.getInstance('TagUtils');
	logger.debug(`Fetching tags for repository: ${repo} (limit: ${limit})`);

	try {
		// Construct URL with tag limit parameter
		const tagsUrl = `${registryUrl}/v2/${repo}/tags/list?n=${limit}`;
		logger.debug(`Requesting tags from ${tagsUrl}`);

		const response = await axios.get(tagsUrl, {
			headers: getAuthHeaders()
		});

		const data = response.data;

		// Extract and validate repository name
		const name = data.name || extractRepoName(repo);
		if (!name) {
			logger.error(`Invalid repository name for ${repo}`);
			throw new Error('Invalid repository name');
		}

		// Process tags if available
		let tags: ImageTag[] = [];
		if (Array.isArray(data.tags) && data.tags.length > 0) {
			logger.debug(`Found ${data.tags.length} tags for ${repo} (limited to ${limit})`);

			// Fetch metadata for each tag in parallel
			tags = await Promise.all<ImageTag>(
				data.tags.map(async (tag: string): Promise<ImageTag> => {
					try {
						const metadata = await fetchDockerMetadataAxios(registryUrl, repo, tag);
						return { name: tag, metadata };
					} catch (error: unknown) {
						logger.error(`Error fetching metadata for ${repo}:${tag}:`, error instanceof Error ? error.message : String(error));
						return { name: tag, metadata: undefined };
					}
				})
			);
		} else {
			logger.info(`No tags found for repository ${repo}`);
		}

		// Return complete repository data
		return {
			name,
			fullName: repo,
			tags
		};
	} catch (error) {
		// Handle errors gracefully
		if (error instanceof AxiosError) {
			logger.error(`Network error fetching tags for ${repo}: ${error.message}`, {
				status: error.response?.status,
				data: error.response?.data
			});
		} else {
			logger.error(`Error fetching repo images for ${repo}:`, error instanceof Error ? error.message : String(error));
		}

		// Return fallback structure with empty tags
		const fallbackName = extractRepoName(repo, 'unknown');
		return {
			name: fallbackName,
			fullName: repo,
			tags: []
		};
	}
}
