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
		if (!manifestResponse.ok) {
			throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
		}

		const manifest = await manifestResponse.json();
		const configDigest = manifest.config?.digest;
		const contentDigest = manifestResponse.headers.get("docker-content-digest");

		if (!configDigest) {
			throw new Error('Config digest not found in manifest.');
		}

		const totalSize = manifest.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;

		// Fetch the image config JSON
		const configUrl = `${registryUrl}/v2/${repo}/blobs/${configDigest}`;
		const configResponse = await fetch(configUrl);

		if (!configResponse.ok) {
			throw new Error(`Failed to fetch config JSON: ${configResponse.status}`);
		}

		const config = await configResponse.json();

		const author = config.config?.Labels?.["org.opencontainers.image.authors"] || config.config?.Labels?.["org.opencontainers.image.vendor"] || "Unknown";

		const cmd = config.config?.Cmd ? config.config.Cmd.join(" ") : "Unknown Command";

		const description = config.config?.Labels?.["org.opencontainers.image.description"] || "No description found";

		const exposedPorts = config.config?.ExposedPorts
			? Object.keys(config.config.ExposedPorts)
			: [];

		// Extract Dockerfile commands from history
		const history = config.history || [];
		const dockerfileCommands = history
			.map((entry: any) => entry.created_by)
			.filter((command: string) => command && !command.includes("#(nop)")) // Remove metadata commands
			.map((command: string) => command.replace("/bin/sh -c ", "")) // Clean up the commands
			.join("\n");

		// Extract important metadata
		return {
			created: config.created, // Creation timestamp
			os: config.os, // OS type
			architecture: config.architecture, // CPU architecture
			author: author,
			dockerFile: dockerfileCommands,
			configDigest: configDigest,
			exposedPorts: exposedPorts,
			totalSize: formatSize(totalSize),
			workDir: config.config.WorkingDir,
			command: cmd,
			description: description,
			contentDigest: contentDigest
		};
	} catch (error) {
		console.error('Error fetching metadata:', error);
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
