interface RegistryRepos {
	repositories: string[];
}

export async function getRegistryRepos(url: string): Promise<RegistryRepos> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	const data = await response.json();
	// @ts-ignore
	return { repositories: data.repositories.map(repo => ({ name: repo })) };
}