import type { PageServerLoad } from './$types';
import { TagService } from '$lib/services/tag-service';

export const load: PageServerLoad = async ({ params }) => {
	const tagService = TagService.getInstance();
	const tagResponse = await tagService.getTag(params.repo, params.image, params.tag);

	return {
		tag: tagResponse,
		repoName: params.repo,
		imageName: params.image,
		tagName: params.tag
	};
};
