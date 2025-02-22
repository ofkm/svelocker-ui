import axios from 'axios';
import { Buffer } from 'buffer';
import { env } from '$env/dynamic/public';

export type HealthStatus = {
	isHealthy: boolean;
	supportsV2: boolean;
	needsAuth: boolean;
	message: string;
};

export async function checkRegistryHealth(registryUrl: string): Promise<HealthStatus> {
	try {
		const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');

		const response = await axios.get(`${registryUrl}/v2/`, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: 'application/json'
			},
			validateStatus: (status) => [200, 401, 404].includes(status)
		});

		const apiVersion = response.headers['docker-distribution-api-version'];

		// Handle different response scenarios
		if (response.status === 200 && apiVersion === 'registry/2.0') {
			return {
				isHealthy: true,
				supportsV2: true,
				needsAuth: false,
				message: 'Registry is healthy and supports V2 API'
			};
		}

		if (response.status === 401) {
			const authHeader = response.headers['www-authenticate'];
			return {
				isHealthy: true,
				supportsV2: apiVersion === 'registry/2.0',
				needsAuth: true,
				message: 'Registry requires authentication'
			};
		}

		if (response.status === 404) {
			return {
				isHealthy: false,
				supportsV2: false,
				needsAuth: false,
				message: 'Registry does not support V2 API'
			};
		}

		return {
			isHealthy: false,
			supportsV2: false,
			needsAuth: false,
			message: 'Unexpected registry response'
		};
	} catch (error) {
		return {
			isHealthy: false,
			supportsV2: false,
			needsAuth: false,
			message: 'Failed to connect to registry'
		};
	}
}
