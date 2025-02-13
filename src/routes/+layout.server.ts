import { getRegistryReposNew } from '$lib/utils/repos.ts';
import { env } from '$env/dynamic/public'

export async function load() {
	// Call the function with the specified URL
	// getRegistryRepos('https://kmcr.cc/v2/_catalog').then(promise => {reposTest = promise.repositories;}).catch(error => console.error('Error:', error));

	// Any child routes or components nested within the layout will also have access to the data prop.
	// 	Code
	//
	// <!-- src/routes/some-page/+page.svelte -->
	// <script lang="ts">
	// import type { PageData } from './$types';
	//
	// export let data: PageData;

	// const repos = await getRegistryRepos(env.PUBLIC_REGISTRY_URL + '/v2/_catalog')

	const repos = await getRegistryReposNew(env.PUBLIC_REGISTRY_URL + '/v2/_catalog')

	return {
		repos: repos,
	};
}