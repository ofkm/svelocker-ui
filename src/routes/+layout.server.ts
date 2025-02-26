import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { checkRegistryHealth } from '$lib/utils/health';
import { RegistryCache } from '$lib/services/db';
// Import the mocks for testing
import { basicMock, searchMock, paginationMock, errorMock, emptyMock, tagDetailsMock, unhealthyStatus } from '../../tests/e2e/mocks.ts';

export async function load({ url }) {
	const logger = Logger.getInstance('LayoutServer');

	// Mock data for tests based on URL parameter
	if (process.env.PLAYWRIGHT === 'true') {
		const mockType = url.searchParams.get('mock');
		logger.debug('Using mock type:', mockType);

		switch (mockType) {
			case 'basic':
				return basicMock;

			case 'search':
				return searchMock;

			case 'pagination':
				return paginationMock;

			case 'error':
				return errorMock;

			case 'empty':
				return emptyMock;

			case 'unhealthy':
				return {
					repos: { repositories: [] },
					error: null,
					healthStatus: unhealthyStatus
				};

			case 'tagDetails':
				return tagDetailsMock;

			default:
				// For default case, return a simple mock
				return basicMock;
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
