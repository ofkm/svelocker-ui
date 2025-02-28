import axios from 'axios';
import { Logger } from '$lib/services/logger';
import { getAuthHeaders } from './repos';

const logger = Logger.getInstance('DeleteManifest');

/**
 * Delete a Docker manifest from the registry
 */
export async function deleteDockerManifestAxios(registryUrl: string, repo: string, digest: string): Promise<void> {
	logger.info(`Deleting manifest: ${registryUrl}/v2/${repo}/manifests/${digest}`);

	try {
		// Make DELETE request to the registry API
		await axios.delete(`${registryUrl}/v2/${repo}/manifests/${digest}`, {
			headers: {
				...getAuthHeaders(),
				Accept: 'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.index.v1+json'
			}
		});

		logger.info(`Successfully deleted manifest: ${registryUrl}/v2/${repo}/manifests/${digest}`);
	} catch (error) {
		logger.error('Error in delete operation:', error);
		throw error;
	}
}
