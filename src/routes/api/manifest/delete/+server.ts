import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logger } from '$lib/services/logger';
import { deleteDockerManifestAxios } from '$lib/utils/delete';

const logger = Logger.getInstance('DeleteImageTag');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { registryUrl, repo, digest, manifestType } = await request.json();

		// logger.info('Delete request received', {
		// 	repo,
		// 	digest,
		// 	manifestType
		// });

		if (!digest) {
			logger.error('No digest provided');
			throw new Error('No digest provided for deletion');
		}

		const cleanDigest = digest.replace(/"/g, '');

		// logger.info(`Processing delete request for ${repo}`, {
		// 	originalDigest: digest,
		// 	cleanDigest,
		// 	manifestType
		// });

		await deleteDockerManifestAxios(registryUrl, repo, cleanDigest);
		return json({ success: true });
	} catch (error) {
		logger.error('Failed to delete manifest:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
