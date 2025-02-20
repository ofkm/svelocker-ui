import axios from 'axios';

export async function deleteDockerManifestAxios(registryUrl: string, repo: string, contentDigest: string) {
	try {
		const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${contentDigest}`;
		console.log(manifestUrl);

		// Set up the request headers
		const headers = {
			Accept: 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json'
		};

		// Send a DELETE request to the manifest URL using Axios
		const response = await axios.delete(manifestUrl, { headers });

		if (response.status !== 202) {
			throw new Error(`Failed to delete manifest: ${response.status}`);
		}

		try {
			const response = await fetch('/api/sync', { method: 'POST' });
			if (!response.ok) {
				throw new Error('Sync failed');
			} else {
				console.log('Successfully synced.');
				console.log('Successfully deleted manifest.');
				return true;
			}
		} catch (error) {
			console.error('Failed to sync:', error);
		}
	} catch (error) {
		console.error('Error deleting manifest:', error);
		return false;
	}
}
