import type { RegistryRepo } from '$lib/models/repo.ts';
import { getDockerTagsNew } from '$lib/utils/tags.ts';
import axios from 'axios';
import { env } from '$env/dynamic/public'

interface RegistryRepos {
	repositories: RegistryRepo[];
}

export async function getRegistryReposAxios(url: string): Promise<RegistryRepos> {
    try {
        const response = await axios.get(url);
        
        // Parse the JSON data
        const { repositories } = response.data as { repositories: string[] };

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
