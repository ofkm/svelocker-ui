import type { RegistryRepo } from '$lib/models/repo.ts';
import type { RepoImage } from '$lib/models/image.ts';
import { getDockerTagsNew } from '$lib/utils/tags.ts';
import type { ImageTag } from '$lib/models/tag.ts';
import { env } from '$env/dynamic/public'

interface RegistryRepos {
	repositories: RegistryRepo[];
}


// TODO :- Fix Function for new Model Types, Include getting metadata and tags in this function
export async function getRegistryRepos(url: string): Promise<RegistryRepos> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: { repositories: string[] } = await response.json();



		return {
			repositories: data.repositories.map((repo) => ({ name: repo })),
		};
	} catch (error) {
		// Handle errors here
		console.error(error);
		throw error;
	}
}

export async function getRegistryReposNew(url: string): Promise<RegistryRepos> {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		// Parse the JSON data
		const { repositories } = (await response.json()) as { repositories: string[] };

		// Fetch Docker tags for each repository and map results to RegistryRepo objects
		const registryRepos = await Promise.all(
			repositories.map(async (repo) => {
				try {

					const repoImage = await getDockerTagsNew(env.PUBLIC_REGISTRY_URL, repo);
					return {
						name: repoImage.name,
						images: repoImage.tags,
					};
				} catch (error) {
					console.error(`Error fetching tags for ${repo}:`, error);
					return {
						name: repo,
						images: [],
					};
				}
			})
		);

		// Combine all registryRepos into a single array;

		return { repositories: [...registryRepos] };
	} catch (error) {
		console.error(error);
		throw error;
	}
}
