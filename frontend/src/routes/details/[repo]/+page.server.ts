import { RepositoryService } from '$lib/services/repository-service';

export async function load({ params }) {
	const repoService = RepositoryService.getInstance();

	const repoName = params.repo;

	const repoResponse = await repoService.getRepository(repoName);
	return {
		repository: repoResponse,
		repoName
	};
}
