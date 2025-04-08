import { RepositoryService } from '$lib/services/repository-service';

export async function load({ params }) {
	try {
		const repoService = RepositoryService.getInstance();

		const repoName = params.repo;

		const repoResponse = await repoService.getRepository(repoName);
		return {
			repository: repoResponse,
			repoName
		};
	} catch (error) {
		console.error('Error loading page data:', error);
		return {
			repository: [],
			repoName: ''
		};
	}
}
