// src/routes/api/metadata/[repo]/[tag]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchDockerMetadata } from '$lib/utils/api';
import { getAppConfig } from '$lib/services/config';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('MetadataAPI');

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { repo, tag } = params;
		if (!repo || !tag) {
			return json({ error: 'Repository and tag are required' }, { status: 400 });
		}

		const registryUrl = await getAppConfig('registry_url');
		const metadata = await fetchDockerMetadata(registryUrl, repo, tag);

		if (!metadata) {
			return json({ error: 'Metadata not found' }, { status: 404 });
		}

		return json(metadata);
	} catch (error) {
		logger.error('Error fetching metadata:', error);
		return json(
			{
				error: 'Failed to fetch metadata',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
