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
		try {
			const tagService = TagService.getInstance();

			// Extract form data (for any potential confirmation fields)
			const formData = await request.formData();
			const confirmation = formData.get('confirm');

			// Optional: Check for confirmation
			if (confirmation !== 'true') {
				return { success: false, error: 'Please confirm deletion' };
			}

			// Call delete method in service
			await tagService.deleteTag(params.repo, params.image, params.tag);

			// Redirect to the image page after successful deletion
			throw redirect(303, `/details/${params.repo}/${params.image}`);
		} catch (err) {
			// Handle errors
			console.error('Failed to delete tag:', err);
			throw error(500, { message: 'Failed to delete tag' });
		}
	}
};
