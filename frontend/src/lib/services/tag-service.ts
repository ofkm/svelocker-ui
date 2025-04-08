import axios from 'axios';
import type { Tag } from '$lib/types';
import { Logger } from './logger';

export class TagService {
	private static instance: TagService;
	private logger = Logger.getInstance('TagService');
	private baseUrl = 'http://localhost:8080';

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
			const response = await axios.get<Tag[]>(`${this.baseUrl}/api/v1/repositories/${encodeURIComponent(repoName)}/images/${encodeURIComponent(imageName)}/tags`);
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
			const response = await axios.get<Tag>(`${this.baseUrl}/api/v1/repositories/${encodeURIComponent(repoName)}/images/${encodeURIComponent(imageName)}/tags/${encodeURIComponent(tagName)}`);
			this.logger.info('Tag data received:', response.data);
			return response.data;
		} catch (error) {
			this.logger.error(`Failed to get tag ${tagName}:`, error);
			throw error;
		}
	}
}
