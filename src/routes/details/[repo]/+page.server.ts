import { error } from '@sveltejs/kit';
import { getRepositoryData } from '$lib/services/database';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('RepositoryDetails');

export async function load({ params }) {
	try {
		const repoName = params.repo;

		if (!repoName) {
			throw error(404, 'Repository not found');
		}

		// Fetch repository details from the database
		const repositoryData = await getRepositoryData(repoName);

		if (!repositoryData) {
			throw error(404, `Repository '${repoName}' not found`);
		}

		// Return repository data for the page
		return {
			repo: repositoryData,
			repoName
		};
	} catch (err) {
		logger.error('Failed to load repository details', err);
		throw error(500, 'Failed to load repository details');
	}
}
