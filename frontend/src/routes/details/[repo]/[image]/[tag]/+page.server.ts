import type { PageServerLoad, Actions } from './$types';
import { TagService } from '$lib/services/tag-service';
import { error, redirect } from '@sveltejs/kit';

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

export const actions: Actions = {
	deleteTag: async ({ params, request }) => {
		const tagService = TagService.getInstance();

		// Extract form data
		const formData = await request.formData();
		const confirmation = formData.get('confirm');

		// Optional: Check for confirmation
		if (confirmation !== 'true') {
			return { success: false, error: 'Please confirm deletion' };
		}

		try {
			// Call delete method in service
			await tagService.deleteTag(params.repo, params.image, params.tag);

			// Throw a redirect instead of returning an object
			throw redirect(303, `/details/${params.repo}/${params.image}`);
		} catch (err: any) {
			console.error('Server action deleteTag failed:', err);
			
			// Return error instead of throwing to prevent page crash
			return { 
				success: false, 
				error: `Failed to delete tag: ${err.message || err}`,
				details: {
					repo: params.repo,
					image: params.image,
					tag: params.tag,
					errorType: err.name || 'Unknown',
					statusCode: err.response?.status,
					responseData: err.response?.data
				}
			};
		}
	}
};
