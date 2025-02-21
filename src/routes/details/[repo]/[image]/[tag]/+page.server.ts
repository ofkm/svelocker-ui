import type { PageServerLoad } from './$types';
import { Logger } from '$lib/services/logger';

export const load: PageServerLoad = async ({ params, parent }) => {
	// Initialize logger for this page
	const logger = Logger.getInstance('TagDetails');
	const { repos } = await parent();
	const repoName = params.repo;
	const imageName = params.image;
	const tagName = params.tag;

	// Find the repository
	const repoIndex = repos.repositories.findIndex((r) => r.name === repoName);
	if (repoIndex === -1) {
		const error = `Repository ${repoName} not found`;
		logger.error(error);
		throw new Error(error);
	}

	const repo = repos.repositories[repoIndex];

	// Find the image that matches both repo and image name
	const image = repo.images.find((img) => img.name === imageName);
	if (!image) {
		const error = `Image ${imageName} not found in ${repoName}`;
		logger.error(error);
		throw new Error(error);
	}

	// Find the tag within the image's tags array
	const tagIndex = image.tags.findIndex((t) => t.name === tagName);
	if (tagIndex === -1) {
		const error = `Tag ${tagName} not found in ${imageName}`;
		logger.error(error);
		throw new Error(error);
	}

	logger.info(`Successfully loaded details for ${repoName}/${imageName}:${tagName}`);

	return {
		repositories: repos.repositories,
		repo: repoName,
		tag: image,
		repoIndex,
		tagIndex,
		imageFullName: `${repoName}/${imageName}`,
		isLatest: tagName === 'latest'
	};
};
