export async function fetchDockerManifest(url: string) {
	try {
		const response = await fetch(url, {
			headers: {
				Accept: 'application/vnd.docker.distribution.manifest.v2+json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const manifest = await response.json();

		console.log('Docker Manifest:', manifest);

		// Extracting key details
		const schemaVersion = manifest.schemaVersion;
		const mediaType = manifest.mediaType;
		const configDigest = manifest.config?.digest;
		const layers = manifest.layers?.map((layer: any) => ({
			mediaType: layer.mediaType,
			size: layer.size,
			digest: layer.digest
		}));

		return {
			schemaVersion,
			mediaType,
			configDigest,
			layers
		};
	} catch (error) {
		console.error('Error fetching manifest:', error);
	}
}

export async function fetchDockerMetadata(registryUrl: string, repo: string, tag: string) {
	try {
		const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${tag}`;

		// Fetch the manifest JSON
		const manifestResponse = await fetch(manifestUrl, {
			headers: {
				Accept:
					'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json'
			}
		});

		// const manifestResponse = await fetch(manifestUrl, requestInit);

		if (!manifestResponse.ok) {
			throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
		}

		const manifest = await manifestResponse.json();
		const configDigest = manifest.config?.digest;

		if (!configDigest) {
			throw new Error('Config digest not found in manifest.');
		}

		// console.log("Config Digest:", configDigest);

		// Fetch the image config JSON
		const configUrl = `${registryUrl}/v2/${repo}/blobs/${configDigest}`;
		const configResponse = await fetch(configUrl);

		if (!configResponse.ok) {
			throw new Error(`Failed to fetch config JSON: ${configResponse.status}`);
		}

		const config = await configResponse.json();

		// Extract important metadata
		const metadata = {
			created: config.created, // Creation timestamp
			os: config.os, // OS type
			architecture: config.architecture, // CPU architecture
			author: config.author, // Image author (if available)
			history: config.history?.map((entry: any) => entry.created_by), // Commands used
			configDigest: configDigest
		};

		return metadata;
	} catch (error) {
		console.error('Error fetching metadata:', error);
	}
}

// Example usage
// fetchDockerMetadata("https://kmcr.cc", "ofkm/caddy", "latest")
// 	.then(data => console.log("Extracted Metadata:", data))
// 	.catch(error => console.error("Fetch error:", error));
