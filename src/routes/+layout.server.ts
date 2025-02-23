import { getRegistryReposAxios } from '$lib/utils/repos.ts';
import { env } from '$env/dynamic/public';
import type { RegistryRepo } from '$lib/models/repo';
import { RegistryCache } from '$lib/services/db';
import { Logger } from '$lib/services/logger';
import { checkRegistryHealth } from '$lib/utils/health';

const logger = Logger.getInstance('LayoutServer');

export async function load({ url }) {
	// Mock data for tests based on URL parameter
	if (process.env.PLAYWRIGHT === 'true') {
		const mockType = url.searchParams.get('mock');

		switch (mockType) {
			case 'basic':
				return {
					repos: {
						repositories: [
							{
								name: 'namespace1',
								images: [
									{
										name: 'mock-app',
										fullName: 'namespace1/mock-app',
										tags: ['latest', 'v1.0.0']
									}
								]
							}
						]
					},
					error: null
				};

			case 'search':
				return {
					repos: {
						repositories: [
							{
								name: 'namespace1',
								images: [
									{
										name: 'frontend-app',
										fullName: 'namespace1/frontend-app',
										tags: ['latest', 'v1.0.0']
									},
									{
										name: 'backend-api',
										fullName: 'namespace1/backend-api',
										tags: ['latest']
									}
								]
							}
						]
					},
					error: null
				};

			case 'pagination':
				const repositories: RegistryRepo[] = Array.from({ length: 12 }, (_, i) => ({
					name: `namespace${i + 1}`,
					images: [
						{
							name: `repo-${i + 1}`,
							fullName: `namespace${i + 1}/repo-${i + 1}`,
							tags: ['latest']
						}
					]
				}));
				return {
					repos: { repositories },
					error: null
				};

			case 'error':
				return {
					repos: { repositories: [] },
					error: 'Failed to connect to registry'
				};

			case 'empty':
				return {
					repos: { repositories: [] },
					error: null
				};

			default:
				// Important: Handle the case when no mock type is specified
				return {
					repos: {
						repositories: [
							{
								name: 'namespace1',
								images: [
									{
										name: 'mock-app',
										fullName: 'namespace1/mock-app',
										tags: ['latest', 'v1.0.0']
									}
								]
							}
						]
					},
					error: null
				};
		}
	}

	try {
		// Check registry health first
		logger.info(`Checking registry health at ${env.PUBLIC_REGISTRY_URL}`);
		const healthStatus = await checkRegistryHealth(env.PUBLIC_REGISTRY_URL);

		// Get fresh data from registry
		logger.info('Fetching registry data');
		const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');

		// Sync to cache
		await RegistryCache.syncFromRegistry(registryData.repositories);
		const repositories = RegistryCache.getRepositories();

		logger.info(`Successfully retrieved ${repositories.length} repositories`);

		return {
			repos: { repositories },
			healthStatus
		};
	} catch (error) {
		logger.error('Failed to fetch registry data:', error);

		// Try to return cached data on failure
		try {
			const repositories = RegistryCache.getRepositories();
			logger.info(`Falling back to cached data with ${repositories.length} repositories`);

			return {
				repos: { repositories },
				healthStatus: {
					isHealthy: false,
					supportsV2: false,
					needsAuth: false,
					message: 'Failed to connect to registry'
				}
			};
		} catch (cacheError) {
			logger.error('Cache retrieval failed:', cacheError);
			return {
				error: true,
				healthStatus: {
					isHealthy: false,
					supportsV2: false,
					needsAuth: false,
					message: 'Failed to connect to registry and cache'
				}
			};
		}
	}
}
