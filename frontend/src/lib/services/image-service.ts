import axios from 'axios';
import type { Image } from '$lib/types';
import { Logger } from './logger';

export class ImageService {
	private static instance: ImageService;
	private logger = Logger.getInstance('ImageService');
	private imageCache: Map<string, Image[]> = new Map();
	private singleImageCache: Map<string, Image> = new Map();
	private baseUrl = 'http://localhost:8080';

	private constructor() {}

	public static getInstance(): ImageService {
		if (!ImageService.instance) {
			ImageService.instance = new ImageService();
		}
		return ImageService.instance;
	}

	/**
	 * List all images for a repository
	 */
	async listImages(repoName: string): Promise<Image[]> {
		try {
			// Check cache first
			const cacheKey = repoName;
			const cachedImages = this.imageCache.get(cacheKey);
			if (cachedImages) {
				return cachedImages;
			}

			const response = await axios.get<Image[]>(`${this.baseUrl}/api/v1/repositories/${encodeURIComponent(repoName)}/images`);

			// Update cache
			this.imageCache.set(cacheKey, response.data);

			return response.data;
		} catch (error) {
			this.logger.error(`Failed to list images for repository ${repoName}:`, error);
			throw error;
		}
	}

	/**
	 * Get a single image by repository name and image name
	 */
	async getImage(repoName: string, imageName: string): Promise<Image> {
		try {
			// Check cache first
			const cacheKey = `${repoName}/${imageName}`;
			const cachedImage = this.singleImageCache.get(cacheKey);
			if (cachedImage) {
				return cachedImage;
			}

			const response = await axios.get<Image>(`${this.baseUrl}/api/v1/repositories/${encodeURIComponent(repoName)}/images/${encodeURIComponent(imageName)}`);

			// Update cache
			this.singleImageCache.set(cacheKey, response.data);

			return response.data;
		} catch (error) {
			this.logger.error(`Failed to get image ${imageName} in repository ${repoName}:`, error);
			throw error;
		}
	}

	/**
	 * Clear all cached images
	 */
	clearCache(): void {
		this.imageCache.clear();
		this.singleImageCache.clear();
	}

	/**
	 * Clear cached images for a specific repository
	 */
	clearRepositoryCache(repoName: string): void {
		this.imageCache.delete(repoName);

		// Clear single image cache entries for this repository
		for (const key of this.singleImageCache.keys()) {
			if (key.startsWith(repoName + '/')) {
				this.singleImageCache.delete(key);
			}
		}
	}
}

// Example usage:
// const imageService = ImageService.getInstance();
// const images = await imageService.listImages('library/ubuntu');
// const singleImage = await imageService.getImage('library/ubuntu', 'ubuntu');
