import axios from 'axios';
import type { ImageMetadata } from '$lib/models/metadata.ts';

export async function fetchDockerMetadataAxios(registryUrl: string, repo: string, tag: string): Promise<ImageMetadata | undefined> {
    try {
        const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${tag}`;

        // Fetch the manifest JSON with Axios
        const manifestResponse = await axios.get(manifestUrl, {
            headers: {
                Accept: 'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.oci.index.manifest.v1+json'
            }
        });



        const manifest = manifestResponse.data;

		// Check if the manifest is of type OCI or Docker and handle accordingly
		const isOciManifest = manifest.mediaType === 'application/vnd.oci.image.index.v1+json';
		const contentDigest = manifestResponse.headers['docker-content-digest'];

		if (isOciManifest) {
			// It was built withput using --format docker 
			//docker buildx build --platform linux/amd64 --format docker -t BUILD-NAME .
		}


        const configDigest = manifest.config?.digest;
        

		
        if (!configDigest) {
            throw new Error('Config digest not found in manifest.');
        }

        const totalSize = manifest.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;

        // Fetch the image config JSON
        const configUrl = `${registryUrl}/v2/${repo}/blobs/${configDigest}`;
        const configResponse = await axios.get(configUrl);

        const config = configResponse.data;

        const author = config.config?.Labels?.["org.opencontainers.image.authors"] || config.config?.Labels?.["org.opencontainers.image.vendor"] || "Unknown";
        const cmd = config.config?.Cmd ? config.config.Cmd.join(" ") : "Unknown Command";
        const description = config.config?.Labels?.["org.opencontainers.image.description"] || "No description found";
        const exposedPorts = config.config?.ExposedPorts ? Object.keys(config.config.ExposedPorts) : [];

        // Extract important metadata
        return {
            created: config.created, // Creation timestamp
            os: config.os, // OS type
            architecture: config.architecture, // CPU architecture
            author: author,
            dockerFile: config.history?.map((entry: any) => entry.created_by).join("\n") || "No Dockerfile found",
            configDigest: configDigest,
            exposedPorts: exposedPorts,
            totalSize: formatSize(totalSize),
            workDir: config.config.WorkingDir,
            command: cmd,
            description: description,
            contentDigest: contentDigest
        };
    } catch (error) {
        console.error(`Error fetching metadata for ${repo}:${tag}:`);
    }
}

function formatSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let i = 0;
	while (bytes >= 1024 && i < units.length - 1) {
		bytes /= 1024;
		i++;
	}
	return `${bytes.toFixed(2)} ${units[i]}`;
}
