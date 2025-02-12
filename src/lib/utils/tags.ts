// {"name":"ofkm/caddy","tags":["latest","main","1.0.1","1.0","1","f84cee9"]}

interface RegistryTag {
	name: string;
}

interface RegistryImage {
	name: string;
	tags: RegistryTag[];
}

export async function list(): Promise<RegistryImage> {
	const response = await fetch('https://kmcr.cc/v2/ofkm/caddy/tags/list');
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	const data = await response.json();
	const name = data.name;
	const tags = Object.values(data.tags).map((name) => ({ name }));

	return {
		name,
		tags,
	};
}

// manifest url: https://kmcr.cc/v2/ofkm/caddy/manifests/latest
// detailed blob json file: https://kmcr.cc/v2/ofkm/caddy/blobs/sha256:f2caad66696fc7c6a29c5b286f5f4056b8fc38a957f1e8ba5af9e55a34fd5a13
// the above sha256 is pulled from the manifests file and its the config.digest sha