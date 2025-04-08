import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { checkRegistryHealth } from '$lib/utils/api/health';
import { AppConfigService } from '$lib/services/app-config-service';

const logger = Logger.getInstance('LayoutServer');

export async function load() {
	try {
		// Check registry health
		const healthStatus = await checkRegistryHealth(env.PUBLIC_REGISTRY_URL);
		const configService = AppConfigService.getInstance();

		await configService.loadAllConfigs();
		const registryName = (await configService.getConfig('registry_name')) || 'Docker Registry';
		const registryUrl = await configService.getConfig('registry_url');

		return {
			healthStatus,
			appConfig: {
				registryName,
				registryUrl
			}
		};
	} catch (error) {
		logger.error('Failed to check registry health on layout load:', error);
		return {
			error: true, // Indicate an error occurred
			healthStatus: {
				isHealthy: false
			},
			appConfig: {
				registryName: 'Docker Registry',
				registryUrl: null
			}
		};
	}
}
