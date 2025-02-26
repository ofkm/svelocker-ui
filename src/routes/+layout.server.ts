import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { checkRegistryHealth } from '$lib/utils/health';
import { initDatabase, syncFromRegistry } from '$lib/services/database';
// Import the mocks for testing
import { basicMock, searchMock, paginationMock, errorMock, emptyMock, tagDetailsMock, unhealthyStatus } from '../../tests/e2e/mocks.ts';

const logger = Logger.getInstance('LayoutServer');

export async function load() {
	try {
		// Initialize database (runs migrations if needed)
		await initDatabase();

		// Check registry health
		const healthStatus = await checkRegistryHealth(env.PUBLIC_REGISTRY_URL);

		if (healthStatus.isHealthy) {
			// Fetch registry data
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');

			// Sync to database
			await syncFromRegistry(registryData.repositories);

			logger.info('Registry data synced to database');
		}

		return {
			healthStatus
		};
	} catch (error) {
		logger.error('Failed to initialize data', error);
		return {
			error: true,
			healthStatus: {
				isHealthy: false
			}
		};
	}
}
