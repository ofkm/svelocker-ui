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
