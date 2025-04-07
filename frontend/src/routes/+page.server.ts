import { RepositoryService } from '$lib/services/repository-service';
import { AppConfigService } from '$lib/services/app-config-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Get instances of our services
		const repoService = RepositoryService.getInstance();
		const configService = AppConfigService.getInstance();

		// Load all repositories with pagination (first page, 10 items)
		const repoResponse = await repoService.listRepositories(1, 10);

		// Load app configurations
		await configService.loadAllConfigs();
		const registryName = (await configService.getConfig('registry_name')) || 'Docker Registry';
		const registryUrl = await configService.getConfig('registry_url');

		return {
			repositories: repoResponse.repositories,
			totalRepos: repoResponse.totalCount,
			appConfig: {
				registryName,
				registryUrl
			}
		};
	} catch (error) {
		console.error('Error loading page data:', error);
		return {
			repositories: [],
			totalRepos: 0,
			appConfig: {
				registryName: 'Docker Registry',
				registryUrl: null
			}
		};
	}
};
