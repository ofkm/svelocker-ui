import { RepositoryService } from '$lib/services/repository-service';
import { AppConfigService } from '$lib/services/app-config-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Get instances of our services
		const repoService = RepositoryService.getInstance();
		const configService = AppConfigService.getInstance();

		// Load repositories directly from backend without URL parameters
		// Backend will handle pagination and defaults
		const repoResponse = await repoService.listRepositories();

		// Load app configurations
		await configService.loadAllConfigs();
		const registryName = (await configService.getConfig('registry_name')) || 'Docker Registry';
		const registryUrl = await configService.getConfig('registry_url');

		// Check registry health if needed
		const healthStatus = { isHealthy: true }; // Replace with actual health check if available

		return {
			repositories: repoResponse.repositories,
			totalCount: repoResponse.totalCount,
			page: repoResponse.page,
			limit: repoResponse.limit,
			healthStatus,
			appConfig: {
				registryName,
				registryUrl
			}
		};
	} catch (error) {
		console.error('Error loading page data:', error);
		return {
			repositories: [],
			totalCount: 0,
			page: 1,
			limit: 5,
			search: '',
			error: 'Failed to load repositories',
			appConfig: {
				registryName: 'Docker Registry',
				registryUrl: null
			}
		};
	}
};
