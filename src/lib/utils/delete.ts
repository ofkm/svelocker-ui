export async function deleteDockerManifest(registryUrl: string, repo: string, tag: string) {
	try {
		const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${tag}`;
		console.log(manifestUrl)

		// Set up the request headers
		const headers = {
			'Accept': 'application/json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json',
			// 'Docker-Content-Digest': configDigest, // Provide the config digest if available, otherwise leave empty
			// 'Authorization': `Bearer YOUR_TOKEN` // Replace with your token or remove if not required
		};

		// Send a DELETE request to the manifest URL
		const response = await fetch(manifestUrl, { method: 'DELETE' } );

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