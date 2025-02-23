import axios from 'axios';
import { Buffer } from 'buffer';
import { env } from '$env/dynamic/public';
import { Logger } from '$lib/services/logger';

export type HealthStatus = {
	isHealthy: boolean;
	supportsV2: boolean;
	needsAuth: boolean;
	message: string;
};

export async function checkRegistryHealth(registryUrl: string): Promise<HealthStatus> {
	const logger = Logger.getInstance('RegistryHealth');

	try {
		logger.info(`Checking registry health for ${registryUrl}`);
		const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');

		const response = await axios.get(`${registryUrl}/v2/`, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: 'application/json'
			},
			validateStatus: (status) => [200, 401, 404].includes(status)
		});

		const apiVersion = response.headers['docker-distribution-api-version'];
		logger.debug('Registry response', {
			status: response.status,
			apiVersion,
			headers: response.headers
		});

		// Handle different response scenarios
		if (response.status === 200 && apiVersion === 'registry/2.0') {
			logger.info('Registry is healthy and supports V2 API');
			return {
				isHealthy: true,
				supportsV2: true,
				needsAuth: false,
				message: 'Registry is healthy and supports V2 API'
			};
		}

		if (response.status === 401) {
			const authHeader = response.headers['www-authenticate'];
			logger.warn('Registry requires authentication', { authHeader });
			return {
				isHealthy: true,
				supportsV2: apiVersion === 'registry/2.0',
				needsAuth: true,
				message: 'Registry requires authentication'
			};
		}

		if (response.status === 404) {
			logger.error('Registry does not support V2 API');
			return {
				isHealthy: false,
				supportsV2: false,
				needsAuth: false,
				message: 'Registry does not support V2 API'
			};
		}

		logger.warn('Unexpected registry response', { status: response.status });
		return {
			isHealthy: false,
			supportsV2: false,
			needsAuth: false,
			message: 'Unexpected registry response'
		};
	} catch (error) {
		logger.error('Failed to connect to registry', error);
		return {
			isHealthy: false,
			supportsV2: false,
			needsAuth: false,
			message: 'Failed to connect to registry'
		};
	}
}
