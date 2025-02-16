import axios from 'axios';
import type { ImageMetadata } from '$lib/models/metadata.ts';

export async function fetchDockerMetadataAxios(
	registryUrl: string,
	repo: string,
	tag: string
): Promise<ImageMetadata | undefined> {
	const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${tag}`;

	try {
		// Fetch the manifest JSON with Axios
		const manifestResponse = await axios.get(manifestUrl, {
			headers: {
				Accept:
					'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.oci.index.manifest.v1+json'
			}
		});

		const manifest = manifestResponse.data;

		// Check if the manifest is of type OCI or Docker and handle accordingly
		const isOciManifest = manifest.mediaType === 'application/vnd.oci.image.index.v1+json';
		// Extract the content digest from the response headers
		const contentDigest = manifestResponse.headers['docker-content-digest'];

		if (isOciManifest) {
			// Handle OCI manifest if necessary
		}

		const configDigest = manifest.config?.digest;

		if (!configDigest) {
			throw new Error('Config digest not found in manifest.');
		}

		const totalSize =
			manifest.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;

		// Fetch the image config JSON
		const configUrl = `${registryUrl}/v2/${repo}/blobs/${configDigest}`;
		let config;
		try {
			const configResponse = await axios.get(configUrl);
			config = configResponse.data;
		} catch (error) {
			throw new Error(
				`Error fetching image config JSON: ${error instanceof Error ? error.message : error}`
			);
		}

		const author =
			config.config?.Labels?.['org.opencontainers.image.authors'] ||
			config.config?.Labels?.['org.opencontainers.image.vendor'] ||
			'Unknown';
		const cmd = config.config?.Cmd ? config.config.Cmd.join(' ') : 'Unknown Command';
		const entrypoint = config.config?.Entrypoint
			? config.config.Entrypoint.join(' ')
			: 'Unknown Entrypoint';
		const description =
			config.config?.Labels?.['org.opencontainers.image.description'] || 'No description found';
		const exposedPorts = config.config?.ExposedPorts ? Object.keys(config.config.ExposedPorts) : [];
		const dockerFile =
			config.history?.map((entry: any) => entry.created_by).join('\n') || 'No Dockerfile found';

		// Extract important metadata
		return {
			created: config.created, // Creation timestamp
			os: config.os, // OS type
			architecture: config.architecture, // CPU architecture
			author: author,
			dockerFile: dockerFile,
			configDigest: configDigest,
			exposedPorts: exposedPorts,
			totalSize: formatSize(totalSize),
			workDir: config.config.WorkingDir,
			command: cmd,
			description: description,
			contentDigest: contentDigest,
			entrypoint: entrypoint
		};
	} catch (error) {
		console.error(
			`Error fetching metadata for ${repo}:${tag}: ${error instanceof Error ? error.message : error}`
		);
		return undefined; // Return undefined in case of an error
	}
}

function formatSize(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let i = 0;
	while (bytes >= 1024 && i < units.length - 1) {
		bytes /= 1024;
		i++;
	}
	return `${bytes.toFixed(2)} ${units[i]}`;
}
