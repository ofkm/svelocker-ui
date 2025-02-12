import type { RegistryRepo } from '$lib/models/repo.ts';

interface RegistryRepos {
	repositories: RegistryRepo[];
}

export async function getRegistryRepos(url: string): Promise<RegistryRepos> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	// const data = await response.json();
	const data: { repositories: string[] } = await response.json();
	// return { repositories: data.repositories.map(repo => ({ name: repo })) };
	return { repositories: data.repositories.map((repo) => ({ name: repo })) };
}
