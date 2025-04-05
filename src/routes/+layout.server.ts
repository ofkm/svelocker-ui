import { Logger } from '$lib/services/logger';
import { getAppConfig } from '$lib/services/database/config';
import { checkRegistryHealth } from '$lib/utils/api/health';

const logger = Logger.getInstance('LayoutServer');

export async function load() {
	try {
		// Fetch registry URL and name from the database
		const registryUrl = await getAppConfig('registry_url');
		const registryName = await getAppConfig('registry_name');

		// Check registry health
		let healthStatus;
		if (registryUrl) {
			healthStatus = await checkRegistryHealth(registryUrl);
		} else {
			logger.error('Registry URL is null or undefined');
			healthStatus = {
				isHealthy: false,
				message: 'Registry URL is not configured'
			};
		}

		return {
			registryUrl,
			registryName,
			healthStatus
		};
	} catch (error) {
		logger.error('Failed to check registry health on layout load:', error);
		return {
			error: true, // Indicate an error occurred
			registryUrl: null,
			registryName: null,
			healthStatus: {
				isHealthy: false
			}
		};
	}
}
