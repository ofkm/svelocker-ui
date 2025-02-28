import { env } from '$env/dynamic/public';

/**
 * Creates authentication headers for registry requests
 * @returns Authentication headers for Docker Registry API
 */
export function getAuthHeaders(): Record<string, string> {
	const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');
	return {
		Authorization: `Basic ${auth}`,
		Accept: 'application/json'
	};
}
