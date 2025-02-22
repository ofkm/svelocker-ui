import type { RegistryRepo } from '$lib/models/repo.ts';
import { getDockerTagsNew } from '$lib/utils/tags.ts';
import axios from 'axios';
import { env } from '$env/dynamic/public';
import { Buffer } from 'buffer';

interface RegistryRepos {
	repositories: RegistryRepo[];
}

function getNamespace(fullName: string): string {
	return fullName.split('/')[0];
}

export async function getRegistryReposAxios(url: string): Promise<RegistryRepos> {
	try {
		const auth = Buffer.from(`${env.PUBLIC_REGISTRY_USERNAME}:${env.PUBLIC_REGISTRY_PASSWORD}`).toString('base64');

		// const response = await axios.get(url);

		const response = await axios.get(url, {
			headers: {
				Authorization: `Basic ${auth}`,
				Accept: 'application/json'
			}
		});
		const { repositories } = response.data as { repositories: string[] };

		// First, group repositories by namespace
		const namespaceGroups = repositories.reduce(
			(acc, repo) => {
				const namespace = getNamespace(repo);
				if (!acc[namespace]) {
					acc[namespace] = [];
				}
				acc[namespace].push(repo);
				return acc;
			},
			{} as Record<string, string[]>
		);

		// Create RegistryRepo objects for each namespace
		const registryRepos = await Promise.all(
			Object.entries(namespaceGroups).map(async ([namespace, repos]) => {
				const images = await Promise.all(
					repos.map(async (repo) => {
						try {
							const repoImage = await getDockerTagsNew(env.PUBLIC_REGISTRY_URL, repo);
							return {
								name: repo.split('/')[1],
								fullName: repo,
								tags: repoImage.tags
							};
						} catch (error) {
							console.error(`Error fetching tags for ${repo}:`, error);
							return {
								name: repo.split('/')[1],
								fullName: repo,
								tags: []
							};
						}
					})
				);

				return {
					name: namespace,
					images: images
				};
			})
		);

		return { repositories: registryRepos };
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// This new function should be in this structure:
// {
//     repositories: [
//         {
//             name: "ofkm",
//             images: [
//                 {
//                     name: "imagetest",
//                     fullName: "ofkm/imagetest",
//                     tags: [...]
//                 },
//                 {
//                     name: "imagename",
//                     fullName: "ofkm/imagename",
//                     tags: [...]
//                 }
//             ]
//         }
//     ]
// }
