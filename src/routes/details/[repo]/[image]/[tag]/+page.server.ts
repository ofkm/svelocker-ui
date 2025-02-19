import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { repos } = await parent();
	const repoName = params.repo;
	const imageName = params.image;
	const tagName = params.tag;

	// Find the repository
	const repoIndex = repos.repositories.findIndex((r) => r.name === repoName);
	if (repoIndex === -1) {

	const repo = repos.repositories[repoIndex];

	// Find the image that matches both repo and image name
	const image = repo.images.find((img) => img.name === imageName);
	if (!image) throw new Error(`Image ${imageName} not found in ${repoName}`);

	// Find the tag within the image's tags array
	const tagIndex = image.tags.findIndex((t) => t.name === tagName);
	if (tagIndex === -1) throw new Error(`Tag ${tagName} not found in ${imageName}`);

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
