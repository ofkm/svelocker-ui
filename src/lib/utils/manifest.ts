import axios, { AxiosError } from 'axios';
import type { ImageMetadata } from '$lib/models/metadata.ts';
import type { ImageTag } from '$lib/models/tag.ts';
import type { RepoImage } from '$lib/models/image.ts';
import { env } from '$env/dynamic/public';
import { Buffer } from 'buffer';
import { Logger } from '$lib/services/logger';
import { calculateSha256, filterAttestationManifests } from '$lib/utils/oci-manifest';

/**
 * Creates authentication headers for registry requests
 */
function getAuthHeaders(): Record<string, string> {
	const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');
	return {
		Authorization: `Basic ${auth}`,
		Accept: 'application/json'
	};
}

/**
 * Extract repository name from full path
 */
function extractRepoName(fullRepoPath: string, defaultName: string = ''): string {
	return fullRepoPath.split('/').pop() || defaultName;
}

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
		let indexDigest;
		let totalSize = 0;
		let isOCI = false;

		// Store the deletion digest in indexDigest for both types
		indexDigest = manifestResponse.headers['docker-content-digest']?.replace(/"/g, '');
		// logger.info(`Original manifest digest: ${indexDigest}`);

		// For OCI manifests
		if (manifest.mediaType === 'application/vnd.oci.image.index.v1+json') {
			isOCI = true;
			// logger.info('OCI manifest detected');

			// Remove any quotes from the digest
			indexDigest = manifestResponse.headers['docker-content-digest'].replace(/"/g, '');
			// logger.info(`Index Digest: ${indexDigest}`);

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
			// logger.info(`Calculated manifest hash: ${hash}`);
			contentDigest = hash;
		} else {
			// Handle regular Docker manifest
			isOCI = false;
			configDigest = manifest.config?.digest;

			// Ensure we have a contentDigest for non-OCI manifests
			contentDigest = manifestResponse.headers['docker-content-digest']?.replace(/"/g, '') || manifest.config?.digest;

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
			entrypoint: entrypoint,
			indexDigest: indexDigest,
			isOCI: isOCI
		};
	} catch (error) {
		logger.error(`Error fetching metadata for ${repo}:${tag}:`, error);
		return undefined; // Return undefined in case of an error
	}
}

export async function getDockerTagsNew(registryUrl: string, repo: string): Promise<RepoImage> {
	const logger = Logger.getInstance('TagUtils');
	logger.info(`Fetching tags for repository: ${repo}`);

	try {
		// Fetch tags list from registry
		const response = await axios.get(`${registryUrl}/v2/${repo}/tags/list`, {
			headers: getAuthHeaders()
		});

		const data = response.data;

		// Extract and validate repository name
		const name = data.name || extractRepoName(repo);
		if (!name) {
			logger.error(`Invalid repository name for ${repo}`);
			throw new Error('Invalid repository name');
		}

		// Process tags if available
		let tags: ImageTag[] = [];
		if (Array.isArray(data.tags) && data.tags.length > 0) {
			logger.info(`Found ${data.tags.length} tags for ${repo}`);

			// Fetch metadata for each tag in parallel
			tags = await Promise.all(
				data.tags.map(async (tag) => {
					try {
						const metadata = await fetchDockerMetadataAxios(registryUrl, repo, tag);
						return { name: tag, metadata };
					} catch (error) {
						logger.error(`Error fetching metadata for ${repo}:${tag}:`, error instanceof Error ? error.message : String(error));
						return { name: tag, metadata: undefined };
					}
				})
			);
		} else {
			logger.info(`No tags found for repository ${repo}`);
		}

		// Return complete repository data
		return {
			name,
			fullName: repo,
			tags
		};
	} catch (error) {
		// Handle errors gracefully
		if (error instanceof AxiosError) {
			logger.error(`Network error fetching tags for ${repo}: ${error.message}`, {
				status: error.response?.status,
				data: error.response?.data
			});
		} else {
			logger.error(`Error fetching repo images for ${repo}:`, error instanceof Error ? error.message : String(error));
		}

		// Return fallback structure with empty tags
		const fallbackName = extractRepoName(repo, 'unknown');
		return {
			name: fallbackName,
			fullName: repo,
			tags: []
		};
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
