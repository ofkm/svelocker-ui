import { getRegistryReposNew } from '$lib/utils/repos.ts';
import { env } from '$env/dynamic/public'

export async function load() {

	const repos = await getRegistryReposNew(env.PUBLIC_REGISTRY_URL + '/v2/_catalog')

	return {
		repos: repos,
	};
}