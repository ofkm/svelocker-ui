import axios from 'axios';
import { Logger } from '$lib/services/logger';
import { browser } from '$app/environment';

export async function deleteDockerManifestAxios(registryUrl: string, repo: string, contentDigest: string) {
	// Only create logger on server-side
	const logger = !browser ? Logger.getInstance('DockerManifest') : null;

	try {
		const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${contentDigest}`;
		logger?.info(`Deleting manifest: ${manifestUrl}`);

		const headers = {
			Accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json'
		};

		const response = await axios.delete(manifestUrl, { headers });

		if (response.status !== 202) {
			const error = `Failed to delete manifest: ${response.status}`;
			logger?.error(error);
			throw new Error(error);
		}

		try {
			const syncResponse = await fetch('/api/sync', { method: 'POST' });
			if (!syncResponse.ok) {
				const error = 'Sync failed after manifest deletion';
				logger?.error(error);
				throw new Error(error);
			}

			logger?.info(`Successfully deleted and synced manifest for ${repo}`);
			return true;
		} catch (error) {
			logger?.error('Failed to sync after deletion:', error);
			throw error;
		}
	} catch (error) {
		logger?.error('Error in delete operation:', error);
		return false;
	}
}
