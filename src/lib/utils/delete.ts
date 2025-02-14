export async function deleteDockerManifest(registryUrl: string, repo: string, tag: string, contentDigest: string) {
	try {
		const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${contentDigest}`;
		console.log(manifestUrl)

		// Set up the request headers
		const headers = {
			'Accept': 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json',
			// 'Docker-Distribution-API-Version': 'registry/2.0',
			// 'Docker-Content-Digest': configDigest, // Provide the config digest if available, otherwise leave empty
			// 'Authorization': `Bearer YOUR_TOKEN` // Replace with your token or remove if not required
		};

		// Send a DELETE request to the manifest URL
		const response = await fetch(manifestUrl, { method: 'DELETE' , headers } );

		if (!response.ok) {
			throw new Error(`Failed to delete manifest: ${response.status}`);
		}

		console.log('Successfully deleted manifest.');
		return true;
	} catch (error) {
		console.error('Error deleting manifest:', error);
		return false;
	}
}