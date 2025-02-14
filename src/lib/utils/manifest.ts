export async function fetchDockerfile(registryUrl: string, repo: string, tag: string) {
	try {
		const manifestUrl = `${registryUrl}/v2/${repo}/manifests/${tag}`;

		// Fetch the manifest JSON
		const manifestResponse = await fetch(manifestUrl, {
			headers: { "Accept": "application/vnd.docker.distribution.manifest.v2+json" },
		});

		if (!manifestResponse.ok) {
			throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
		}

		const manifest = await manifestResponse.json();
		const configDigest = manifest.config?.digest;

		if (!configDigest) {
			throw new Error("Config digest not found in manifest.");
		}

		console.log("Config Digest:", configDigest);

		// Fetch the image config JSON
		const configUrl = `${registryUrl}/v2/${repo}/blobs/${configDigest}`;
		const configResponse = await fetch(configUrl);

		if (!configResponse.ok) {
			throw new Error(`Failed to fetch config JSON: ${configResponse.status}`);
		}

		const config = await configResponse.json();

		// Extract Dockerfile commands from history
		const history = config.history || [];
		const dockerfileCommands = history
			.map((entry: any) => entry.created_by)
			.filter((command: string) => command && !command.includes("#(nop)")) // Remove metadata commands
			.map((command: string) => command.replace("/bin/sh -c ", "")) // Clean up the commands
			.join("\n");

		return dockerfileCommands;
	} catch (error) {
		console.error("Error fetching Dockerfile:", error);
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

		const totalSize = manifest.layers?.reduce((sum: number, layer: any) => sum + (layer.size || 0), 0) || 0;

		// Fetch the image config JSON
		const configUrl = `${registryUrl}/v2/${repo}/blobs/${configDigest}`;
		const configResponse = await fetch(configUrl);

		if (!configResponse.ok) {
			throw new Error(`Failed to fetch config JSON: ${configResponse.status}`);
		}

		const config = await configResponse.json();

		const author = config.author || config.config?.Labels?.["org.opencontainers.image.authors"] || "Unknown";

		const cmd = config.config?.Cmd ? config.config.Cmd.join(" ") : "Unknown Command";

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
		const metadata = {
			created: config.created, // Creation timestamp
			os: config.os, // OS type
			architecture: config.architecture, // CPU architecture
			author: author,
			dockerFile: dockerfileCommands,
			configDigest: configDigest,
			exposedPorts: exposedPorts,
			totalSize: formatSize(totalSize),
			workDir: config.config.WorkingDir,
			command: cmd
		};

		return metadata;
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
