// {"name":"ofkm/caddy","tags":["latest","main","1.0.1","1.0","1","f84cee9"]}

import type { ImageTag } from '$lib/models/tag.ts';
import type { RepoImage } from '$lib/models/image.ts';
import { fetchDockerMetadata } from '$lib/utils/manifest.ts';

export async function getDockerTagsNew(registryUrl: string, repo: string): Promise<RepoImage> {

	let tags: ImageTag[] = [];
	let data: { name: string; tags: string[] } = [];

	// Fetch the list of tags
	const response = await fetch(`${registryUrl}/v2/${repo}/tags/list`);
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

	try {
		data = await response.json();

		if (data.tags) {
			tags = await Promise.all(
				data.tags.map(async (tag) => {
					const metadata = await fetchDockerMetadata(registryUrl, repo, tag);
					return { name: tag, metadata };
				})
			);
		}


	} catch (error) {
		console.error('Error fetching repo images:', error);
		return {
			name: data.name,
			tags: []
		};
	}

	// Fetch metadata for each tag

	return {
		name: data.name,
		tags
	};
}

// manifest url: https://registry/v2/ofkm/caddy/manifests/latest
// detailed blob json file: https://registry/v2/ofkm/caddy/blobs/sha256:f2caad66696fc7c6a29c5b286f5f4056b8fc38a957f1e8ba5af9e55a34fd5a13
// the above sha256 is pulled from the manifests file and its the config.digest sha
