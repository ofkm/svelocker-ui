import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../delete/$types';
import { Logger } from '$lib/services/logger';
import { deleteDockerManifestAxios } from '$lib/utils/api';
import { TagModel } from '$lib/services/database/models/tag';
import { db } from '$lib/services/database/connection';
import { incrementalSync } from '$lib/services/database';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { env } from '$env/dynamic/public';

const logger = Logger.getInstance('DeleteAPI');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { registryUrl, repo, digest, manifestType } = await request.json();

		logger.debug('Delete request received', {
			repo,
			digest,
			manifestType
		});

		if (!digest) {
			logger.error('No digest provided');
			throw new Error('No digest provided for deletion');
		}

		const cleanDigest = digest.replace(/"/g, '');

		logger.debug(`Processing delete request for ${repo}`, {
			originalDigest: digest,
			cleanDigest,
			manifestType
		});

		// Delete from registry first
		await deleteDockerManifestAxios(registryUrl, repo, cleanDigest);

		// Now update the database
		// Using a transaction to ensure database consistency
		try {
			db.transaction(() => {
				// Find tags with this digest - Use proper join syntax
				const tagsToDelete = db
					.prepare(
						`
          SELECT t.id, t.image_id, t.name, i.fullName
          FROM tags t
          JOIN images i ON t.image_id = i.id
          LEFT JOIN tag_metadata tm ON tm.tag_id = t.id
          WHERE t.digest = ? 
          OR tm.indexDigest = ?
          OR tm.contentDigest = ?
        `
					)
					.all(cleanDigest, cleanDigest, cleanDigest);

				if (tagsToDelete.length === 0) {
					logger.warn(`No tags found in database with digest ${cleanDigest}`);
				}

				// Log what we're about to delete
				logger.info(`Found ${tagsToDelete.length} tag(s) to delete with digest ${cleanDigest}`);

				for (const tag of tagsToDelete) {
					logger.info(`Deleting tag ${tag.fullName}:${tag.name} (ID: ${tag.id})`);

					// Delete the tag (tag_metadata will be deleted via CASCADE constraint)
					TagModel.delete(tag.id);
				}
			})();

			logger.info('Database updated successfully after tag deletion');
		} catch (dbError) {
			// If database update fails, log but don't fail the request
			// since the registry deletion was successful
			logger.error('Failed to update database after tag deletion:', dbError);
		}

		// Trigger a sync to ensure database is in sync with registry
		// This is optional but helps keep things consistent
		try {
			logger.info('Triggering incremental sync after tag deletion');
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
			await incrementalSync(registryData.repositories, { forceFullSync: false });
		} catch (syncError) {
			logger.error('Failed to sync after tag deletion:', syncError);
		}

		return json({
			success: true,
			message: 'Tag deleted successfully from both registry and database'
		});
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
