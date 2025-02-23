import axios from 'axios';
import type { ImageMetadata } from '$lib/models/metadata.ts';
import { env } from '$env/dynamic/public';
import { Buffer } from 'buffer';
import { Logger } from '$lib/services/logger';
import { calculateSha256, filterAttestationManifests } from '$lib/utils/oci-manifest';

const logger = Logger.getInstance('ManifestUtils');

export async function fetchDockerMetadataAxios(registryUrl: string, repo: string, tag: string): Promise<ImageMetadata | undefined> {
	const logger = Logger.getInstance('ManifestUtils');
	const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${tag}`;

	try {
		const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');
		const manifestResponse = await axios.get(manifestUrl, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: 'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.oci.index.manifest.v1+json'
			}
		});

		const manifest = manifestResponse.data;
		let contentDigest = manifestResponse.headers['docker-content-digest'];
		let configDigest;
		let totalSize = 0;

		// Handle OCI manifest
		if (manifest.mediaType === 'application/vnd.oci.image.index.v1+json') {
			logger.info('OCI manifest detected');

			// Get the first non-attestation manifest
			const platformManifest = manifest.manifests.find((m: any) => !m.annotations?.['vnd.docker.reference.type']);

			if (!platformManifest) {
				throw new Error('No valid platform manifest found');
			}

			// Fetch the platform-specific manifest
			const platformManifestResponse = await axios.get(`${registryUrl}/v2/${repo}/manifests/${platformManifest.digest}`, {
				headers: {
					Authorization: `Basic ${auth}`,
					Accept: platformManifest.mediaType
				}
			});

			// Calculate total size for OCI manifest
			const manifestSize = platformManifest.size || 0;
			const layerSizes = platformManifestResponse.data.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;

			totalSize = manifestSize + layerSizes;

			// Update configDigest from platform manifest
			configDigest = platformManifestResponse.data.config?.digest;

			// Calculate content digest for OCI manifest
			const formattedManifest = JSON.stringify(manifest);
			const filteredManifest = await filterAttestationManifests(formattedManifest);
			const hash = await calculateSha256(filteredManifest);
			logger.info(`Calculated manifest hash: ${hash}`);
			contentDigest = hash;
		} else {
			// Handle regular Docker manifest
			configDigest = manifest.config?.digest;
			// Calculate size for regular Docker manifest
			totalSize = manifest.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;
		}

		if (!configDigest) {
			throw new Error('Config digest not found in manifest.');
		}

		// Fetch the image config JSON
		const configUrl = `${registryUrl}/v2/${repo}/blobs/${configDigest}`;
		let config;
		try {
			// const configResponse = await axios.get(configUrl);
			const configResponse = await axios.get(configUrl, {
				headers: {
					Authorization: `Basic ${auth}`,
					Accept: 'application/json'
				}
			});
			config = configResponse.data;
		} catch (error) {
			throw new Error(`Error fetching image config JSON: ${error instanceof Error ? error.message : error}`);
		}

		const author = config.config?.Labels?.['org.opencontainers.image.authors'] || config.config?.Labels?.['org.opencontainers.image.vendor'] || 'Unknown';
		const cmd = config.config?.Cmd ? config.config.Cmd.join(' ') : 'Unknown Command';
		const entrypoint = config.config?.Entrypoint ? config.config.Entrypoint.join(' ') : 'Unknown Entrypoint';
		const description = config.config?.Labels?.['org.opencontainers.image.description'] || 'No description found';
		const exposedPorts = config.config?.ExposedPorts ? Object.keys(config.config.ExposedPorts) : [];
		const dockerFile = config.history?.map((entry: any) => entry.created_by).join('\n') || 'No Dockerfile found';

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
		logger.error(`Error fetching metadata for ${repo}:${tag}:`, error);
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
