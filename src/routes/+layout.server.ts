import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { checkRegistryHealth } from '$lib/utils/health';
import { RegistryCache } from '$lib/services/db';
import { db } from '$lib/services/db';
// Import the mocks for testing
import { basicMock, searchMock, paginationMock, errorMock, emptyMock, tagDetailsMock, unhealthyStatus } from '../../tests/e2e/mocks.ts';

export async function load({ url }) {
	const logger = Logger.getInstance('LayoutServer');

	// Mock data for tests based on URL parameter
	if (process.env.PLAYWRIGHT === 'true') {
		const mockType = url.searchParams.get('mock');
		logger.debug('Using mock type:', mockType);

		// Return appropriate mock data based on test type
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
					error: null,
					healthStatus: unhealthyStatus
				};
			case 'tagDetails':
				return tagDetailsMock;
			default:
				return basicMock; // Default case, return a simple mock
		}
	}

	try {
		// Check registry health first
		logger.info(`Checking registry health at ${env.PUBLIC_REGISTRY_URL}`);
		const healthStatus = await checkRegistryHealth(env.PUBLIC_REGISTRY_URL);

		// Get data from registry and sync to database
		if (healthStatus.isHealthy) {
			logger.info('Fetching registry data');
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');

			// Sync to cache
			await RegistryCache.syncFromRegistry(registryData.repositories);
		}

		// Return only metadata, not the entire repository list
		// Count repositories
		const repoCount = db.prepare('SELECT COUNT(*) as count FROM repositories').get().count;

		// Get last sync time
		const lastSync =
			db
				.prepare(
					`
            SELECT datetime(MAX(last_synced)) as last_synced 
            FROM repositories
        `
				)
				.get().last_synced || new Date().toISOString();

		logger.info(`Successfully synced ${repoCount} repositories to cache`);

		return {
			// Return minimal data - counts and metadata only
			repoMetadata: {
				count: repoCount,
				lastSynced: lastSync
			},
			healthStatus
		};
	} catch (error) {
		logger.error('Failed to fetch registry data:', error);

		// Try to get minimal metadata from cache on failure
		try {
			const repoCount = db.prepare('SELECT COUNT(*) as count FROM repositories').get().count;
			const lastSync =
				db
					.prepare(
						`
                SELECT datetime(MAX(last_synced)) as last_synced 
                FROM repositories
            `
					)
					.get().last_synced || null;

			logger.info(`Falling back to cached data with ${repoCount} repositories`);

			return {
				repoMetadata: {
					count: repoCount,
					lastSynced: lastSync
				},
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
