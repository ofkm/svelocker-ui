import { error } from '@sveltejs/kit';
import { RegistryCache } from '$lib/services/db';
import { Logger } from '$lib/services/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const logger = Logger.getInstance('TagDetails');

	try {
		const repositories = RegistryCache.getRepositories();

		// Extract params
		const { repo, image, tag } = params;

		logger.info(`Loading details for ${repo}/${image}:${tag}`);

		// Find the repo by name
		let repoObj = repositories.find((r) => r.name === repo);

		// Handle the 'library' namespace case
		if (!repoObj && repo === 'library') {
			// For 'library' namespace, look for root-level images
			repoObj = repositories.find((r) => r.name === 'library');
		}

		if (!repoObj) {
			logger.error(`Repository ${repo} not found`);
			throw error(404, `Repository ${repo} not found`);
		}

		// Find the image within the repo
		const imageObj = repoObj.images.find((img) => img.name === image || img.fullName === `${repo}/${image}` || img.fullName === image);

		if (!imageObj) {
			logger.error(`Image ${image} not found in ${repo}`);
			throw error(404, `Image ${image} not found in ${repo}`);
		}

		// Find the tag
		const tagIndex = imageObj.tags.findIndex((t) => t.name === tag);

		if (tagIndex === -1) {
			logger.error(`Tag ${tag} not found for ${repo}/${image}`);
			throw error(404, `Tag ${tag} not found for ${repo}/${image}`);
		}

		const isLatest = tag === 'latest';

		// Return the data for the page
		return {
			repo,
			imageName: image,
			imageFullName: imageObj.fullName,
			tag: imageObj,
			tagIndex,
			isLatest
		};
	} catch (e) {
		// Handle unexpected errors
		if (e.status && e.body) {
			// This is an error thrown by the error() helper
			throw e;
		} else {
			logger.error('Error loading tag details:', e);
			throw error(500, 'Failed to load image details');
		}
	}
};
