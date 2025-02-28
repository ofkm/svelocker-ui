import type { RegistryRepo } from '$lib/models';
import { getDockerTags } from '$lib/utils/api';
import axios, { AxiosError } from 'axios';
import { Logger } from '$lib/services/logger';
import { getAuthHeaders } from '$lib/utils/api/auth';
import { getNamespace } from '$lib/utils/formatting';

interface RegistryRepos {
	repositories: RegistryRepo[];
}

/**
 * Fetches all repositories from the registry and organizes them by namespace
 * @param url Registry URL
 * @returns Promise resolving to organized repositories
 */
export async function getRegistryReposAxios(url: string): Promise<RegistryRepos> {
	const logger = Logger.getInstance('Registry-GetRepos');

	try {
		// Fix: Make sure we're using the base registry URL, not the catalog URL
		const baseRegistryUrl = url.endsWith('/v2/_catalog') ? url.replace('/v2/_catalog', '') : url;
		const catalogUrl = `${baseRegistryUrl}/v2/_catalog`;

		logger.info(`Fetching repositories from ${catalogUrl}`);

		const response = await axios.get(catalogUrl, {
			headers: getAuthHeaders()
		});

		const { repositories = [] } = response.data as { repositories: string[] };
		logger.info(`Found ${repositories.length} repositories`);

		// Group repositories by namespace
		const reposByNamespace: Record<string, string[]> = {};

		repositories.forEach((repo) => {
			const namespace = getNamespace(repo);

			if (!reposByNamespace[namespace]) {
				reposByNamespace[namespace] = [];
			}

			reposByNamespace[namespace].push(repo);
		});

		// Process each namespace
		const namespacePromises = Object.entries(reposByNamespace).map(async ([namespace, repos]) => {
			// Create a namespace object
			const namespaceObj: RegistryRepo = {
				name: namespace,
				images: []
			};

			// Fetch tags for each repository in parallel
			const imagePromises = repos.map(async (repo) => {
				try {
					// Pass the base registry URL, not the catalog URL
					const repoData = await getDockerTags(baseRegistryUrl, repo);
					namespaceObj.images.push(repoData);
				} catch (error) {
					logger.error(`Error fetching tags for ${repo}:`, error instanceof Error ? error.message : String(error));
				}
			});

			await Promise.all(imagePromises);
			return namespaceObj;
		});

		const namespaces = await Promise.all(namespacePromises);

		// Filter out empty namespaces
		const filteredNamespaces = namespaces.filter((ns) => ns.images.length > 0);

		return { repositories: filteredNamespaces };
	} catch (error) {
		// Improved error logging with type safety and details
		if (axios.isAxiosError(error)) {
			logger.error(`Failed to fetch repositories from ${url}:`, {
				status: error.response?.status,
				url: error.config?.url,
				message: error.message,
				data: error.response?.data
			});
		} else {
			logger.error(`Failed to fetch repositories from ${url}:`, error instanceof Error ? error.message : String(error));
		}
		return { repositories: [] };
	}
}
