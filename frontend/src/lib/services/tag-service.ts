import axios from 'axios';
import type { Tag } from '$lib/types';
import { Logger } from './logger';

export class TagService {
	private static instance: TagService;
	private logger = Logger.getInstance('TagService');
	private tagCache: Map<string, Tag[]> = new Map();
	private singleTagCache: Map<string, Tag> = new Map();

	private constructor() {}

	public static getInstance(): TagService {
		if (!TagService.instance) {
			TagService.instance = new TagService();
		}
		return TagService.instance;
	}

	/**
	 * List all tags for an image in a repository
	 */
	async listTags(repoName: string, imageName: string): Promise<Tag[]> {
		try {
			// Check cache first
			const cacheKey = `${repoName}/${imageName}`;
			const cachedTags = this.tagCache.get(cacheKey);
			if (cachedTags) {
				return cachedTags;
			}

			const response = await axios.get<Tag[]>(`/api/repositories/${encodeURIComponent(repoName)}/images/${encodeURIComponent(imageName)}/tags`);

			// Update cache
			this.tagCache.set(cacheKey, response.data);

			return response.data;
		} catch (error) {
			this.logger.error(`Failed to list tags for image ${imageName} in repository ${repoName}:`, error);
			throw error;
		}
	}

	/**
	 * Get a single tag by repository name, image name, and tag name
	 */
	async getTag(repoName: string, imageName: string, tagName: string): Promise<Tag> {
		try {
			// Check cache first
			const cacheKey = `${repoName}/${imageName}/${tagName}`;
			const cachedTag = this.singleTagCache.get(cacheKey);
			if (cachedTag) {
				return cachedTag;
			}

			const response = await axios.get<Tag>(`/api/repositories/${encodeURIComponent(repoName)}/images/${encodeURIComponent(imageName)}/tags/${encodeURIComponent(tagName)}`);

			// Update cache
			this.singleTagCache.set(cacheKey, response.data);

			return response.data;
		} catch (error) {
			this.logger.error(`Failed to get tag ${tagName} for image ${imageName} in repository ${repoName}:`, error);
			throw error;
		}
	}

	/**
	 * Clear all cached tags
	 */
	clearCache(): void {
		this.tagCache.clear();
		this.singleTagCache.clear();
	}

	/**
	 * Clear cached tags for a specific image
	 */
	clearImageCache(repoName: string, imageName: string): void {
		const cacheKey = `${repoName}/${imageName}`;
		this.tagCache.delete(cacheKey);

		// Clear single tag cache entries for this image
		for (const key of this.singleTagCache.keys()) {
			if (key.startsWith(cacheKey + '/')) {
				this.singleTagCache.delete(key);
			}
		}
	}
}

// Example usage:
// const tagService = TagService.getInstance();
// const tags = await tagService.listTags('library/ubuntu', 'ubuntu');
// const singleTag = await tagService.getTag('library/ubuntu', 'ubuntu', 'latest');
