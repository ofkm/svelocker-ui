import { RepositoryService } from '$lib/services/repository-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Get instances of our services
		const repoService = RepositoryService.getInstance();

		// Load repositories directly from backend without URL parameters
		// Backend will handle pagination and defaults
		const repoResponse = await repoService.listRepositories();

		// Check registry health if needed
		const healthStatus = { isHealthy: true }; // Replace with actual health check if available

		return {
			repositories: repoResponse.repositories,
			totalCount: repoResponse.totalCount,
			page: repoResponse.page,
			limit: repoResponse.limit,
			healthStatus
		};
	} catch (error) {
		console.error('Error loading page data:', error);
		return {
			repositories: [],
			totalCount: 0,
			page: 1,
			limit: 5,
			search: '',
			error: 'Failed to load repositories'
		};
	}
};
