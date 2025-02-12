import { getRegistryRepos } from '$lib/utils/repos.ts';
import { env } from '$env/dynamic/public'

export async function load() {
	// let reposArray = [] as { name: string }[];
	//
	// let reposTest = [] as string[];

	// Call the function with the specified URL
	// getRegistryRepos('https://kmcr.cc/v2/_catalog').then(promise => {reposTest = promise.repositories;}).catch(error => console.error('Error:', error));

	return {
		repos: await getRegistryRepos(env.PUBLIC_REGISTRY_URL + '/v2/_catalog')
	};
}