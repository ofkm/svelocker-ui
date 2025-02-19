import { getRegistryReposAxios } from '$lib/utils/repos.ts';
import { env } from '$env/dynamic/public';

export async function load() {
	try {
		const repos = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
		return {
			repos: repos,
			error: null
		};
	} catch (error) {
		console.error('Failed to connect to registry:', error);
		return {
			repos: { repositories: [] },
			error: 'Failed to connect to registry'
		};
	}
}
