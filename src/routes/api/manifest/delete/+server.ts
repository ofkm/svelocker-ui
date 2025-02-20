import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Logger } from '$lib/services/logger';
import { deleteDockerManifestAxios } from '$lib/utils/delete';

export const POST: RequestHandler = async ({ request }) => {
	const logger = Logger.getInstance('ManifestAPI');

	try {
		const { registryUrl, repo, contentDigest } = await request.json();

		logger.info(`Received delete request for ${repo}`);

		const result = await deleteDockerManifestAxios(registryUrl, repo, contentDigest);

		if (!result) {
			logger.error(`Failed to delete manifest for ${repo}`);
			return json({ success: false }, { status: 500 });
		}

		logger.info(`Successfully deleted manifest for ${repo}`);
		return json({ success: true });
	} catch (error) {
		logger.error('Error processing delete request:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
