import axios from 'axios';
import type { Tag } from '$lib/types';
import { Logger } from './logger';
import { env } from '$env/dynamic/public';

export class TagService {
	private static instance: TagService;
	private logger = Logger.getInstance('TagService');
	private baseUrl: string;

	private constructor() {
		// Determine the backend URL based on environment
		this.baseUrl = this.determineBackendUrl();
		this.logger.info(`TagService initialized with backend URL: ${this.baseUrl}`);
	}

	private determineBackendUrl(): string {
		// Check if PUBLIC_BACKEND_URL is explicitly set
		if (env.PUBLIC_BACKEND_URL) {
			return env.PUBLIC_BACKEND_URL;
		}

		// In server-side context, try to use localhost
		if (typeof window === 'undefined') {
			return 'http://localhost:8080';
		}

		// In client-side context, try to determine from current location
		if (typeof window !== 'undefined' && window.location) {
			const { protocol, hostname } = window.location;
			return `${protocol}//${hostname}:8080`;
		}

		// Fallback to default
		return 'http://localhost:8080';
	}

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

	/**
	 * Delete a tag from a repository
	 */
	async deleteTag(repoName: string, imageName: string, tagName: string): Promise<void> {
		const deleteUrl = `${this.baseUrl}/api/v1/repositories/${encodeURIComponent(repoName)}/images/${encodeURIComponent(imageName)}/tags/${encodeURIComponent(tagName)}`;
		
		this.logger.info(`Attempting to delete tag ${tagName} from ${imageName} in repository ${repoName}`);
		this.logger.info(`DELETE request URL: ${deleteUrl}`);
		this.logger.info(`Backend URL configured as: ${this.baseUrl}`);
		
		try {
			const response = await axios.delete(deleteUrl, {
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				timeout: 30000, // 30 second timeout
			});
			
			this.logger.info(`Successfully deleted tag ${tagName} from image ${imageName} in repository ${repoName}`);
			this.logger.info(`Response status: ${response.status}`);
		} catch (error: any) {
			this.logger.error(`Failed to delete tag ${tagName}:`, error);
			
			if (error.response) {
				// The request was made and the server responded with a status code
				this.logger.error(`Response status: ${error.response.status}`);
				this.logger.error(`Response data:`, error.response.data);
				this.logger.error(`Response headers:`, error.response.headers);
			} else if (error.request) {
				// The request was made but no response was received
				this.logger.error(`No response received. Request details:`, error.request);
				this.logger.error(`Network error - backend may be unreachable at: ${this.baseUrl}`);
			} else {
				// Something happened in setting up the request
				this.logger.error(`Request setup error:`, error.message);
			}
			
			throw error;
		}
	}
}
