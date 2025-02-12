import type { RegistryRepo } from '$lib/models/repo.ts';

interface RegistryRepos {
	repositories: RegistryRepo[];
}

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
