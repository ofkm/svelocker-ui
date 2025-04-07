import axios from 'axios';
import type { Repository, RepositoryResponse } from '$lib/types';
import { Logger } from './logger';

export class RepositoryService {
	private static instance: RepositoryService;
	private logger = Logger.getInstance('RepositoryService');
	private repositoryCache: Map<string, Repository> = new Map();
	private baseUrl = 'http://localhost:8080';

	private constructor() {}

	public static getInstance(): RepositoryService {
		if (!RepositoryService.instance) {
			RepositoryService.instance = new RepositoryService();
		}
		return RepositoryService.instance;
	}

	/**
	 * Get a list of repositories with pagination and search support
	 */
	async listRepositories(page = 1, limit = 10, search = ''): Promise<RepositoryResponse> {
		try {
			const url = new URL('/api/v1/repositories', this.baseUrl);
			url.searchParams.append('page', page.toString());
			url.searchParams.append('limit', limit.toString());
			if (search) {
				url.searchParams.append('search', search);
			}

			const response = await axios.get<RepositoryResponse>(url.toString());

			// Update cache with fetched repositories
			response.data.repositories.forEach((repo) => {
				this.repositoryCache.set(repo.name, repo);
			});

			return response.data;
		} catch (error) {
			this.logger.error('Failed to list repositories:', error);
			throw error;
		}
	}

	/**
	 * Get a single repository by name
	 */
	async getRepository(name: string): Promise<Repository> {
		try {
			// Check cache first
			const cachedRepo = this.repositoryCache.get(name);
			if (cachedRepo) {
				return cachedRepo;
			}

			const response = await axios.get<Repository>(`${this.baseUrl}/api/v1/repositories/${encodeURIComponent(name)}`);

			// Update cache with fetched repository
			this.repositoryCache.set(name, response.data);

			return response.data;
		} catch (error) {
			this.logger.error(`Failed to get repository ${name}:`, error);
			throw error;
		}
	}

	/**
	 * Clear cached repositories
	 */
	clearCache(): void {
		this.repositoryCache.clear();
	}
}

// Example usage:
// const repoService = RepositoryService.getInstance();
// const repositories = await repoService.listRepositories(1, 10, 'ubuntu');
// const singleRepo = await repoService.getRepository('library/ubuntu');
