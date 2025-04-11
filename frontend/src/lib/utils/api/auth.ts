import { env } from '$env/dynamic/public';

/**
 * Creates Basic authentication for registry requests
 * @returns Basic Authentication for Docker Registry API
 */
export function getBasicAuth(): string {
	const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');
	return `Basic ${auth}`;
}

/**
 * Creates authorization headers for registry requests
 * @returns Authorization headers object
 */
export function getAuthHeaders() {
	const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');
	return {
		Authorization: `Basic ${auth}`,
		Accept: 'application/json'
	};
}
