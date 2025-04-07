import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { checkRegistryHealth } from '$lib/utils/api/health';

const logger = Logger.getInstance('LayoutServer');

export async function load() {
	try {
		// Check registry health
		const healthStatus = await checkRegistryHealth(env.PUBLIC_REGISTRY_URL);

		return {
			healthStatus
		};
	} catch (error) {
		logger.error('Failed to check registry health on layout load:', error);
		return {
			error: true, // Indicate an error occurred
			healthStatus: {
				isHealthy: false
			}
		};
	}
}
