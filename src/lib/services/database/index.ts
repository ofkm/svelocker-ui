// src/lib/services/db/index.ts
import { db } from './connection';
import { runMigrations, getDatabaseInfo } from './migrations';
import { RepositoryModel } from './models/repository';
import { ImageModel } from './models/image';
import { TagModel } from './models/tag';
import type { RegistryRepo } from '$lib/models/repo';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('DBService');

export { db, RepositoryModel, ImageModel, TagModel, getDatabaseInfo };

// Initialize database
export async function initDatabase(): Promise<void> {
	await runMigrations();
	logger.info('Database initialized successfully');
}

// Sync registry data to database
export async function syncFromRegistry(registryData: RegistryRepo[]): Promise<void> {
	logger.info(`Syncing ${registryData.length} repositories to database`);

	try {
		db.transaction(() => {
			// Clear existing data
			TagModel.clear();
			ImageModel.clear();
			RepositoryModel.clear();

			// Insert new data
			for (const repo of registryData) {
				const repoName = repo.name || 'library';
				const repoId = RepositoryModel.create(repoName);

				for (const image of repo.images) {
					const imageName = image.name || image.fullName.split('/').pop() || '';
					const imageId = ImageModel.create(repoId, imageName, image.fullName);

					for (const tag of image.tags) {
						const tagId = TagModel.create(imageId, tag.name, tag.metadata?.configDigest || '');

						if (tag.metadata) {
							TagModel.saveMetadata(tagId, tag.metadata);
						}
					}
				}
			}
		})();

		logger.info('Registry data synchronized successfully');
	} catch (error) {
		logger.error('Failed to sync registry data', error);
		throw error;
	}
}

// Query repositories with pagination and search
export async function getRepositories({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }): Promise<{
	repositories: RegistryRepo[];
	totalCount: number;
	page: number;
	limit: number;
}> {
	logger.info(`Fetching repositories (page ${page}, limit ${limit}, search: ${search})`);

	try {
		// Search pattern
		const searchPattern = `%${search}%`;

		// Get paginated repositories
		const repos = db
			.prepare(
				`
      SELECT r.id, r.name as repoName, r.last_synced
      FROM repositories r
      WHERE r.name LIKE ?
      ORDER BY r.name
      LIMIT ? OFFSET ?
    `
			)
			.all(searchPattern, limit, (page - 1) * limit) as { id: number; repoName: string; last_synced: string }[];

		// Get total count
		const countResult = db
			.prepare(
				`
      SELECT COUNT(*) as count
      FROM repositories r
      WHERE r.name LIKE ?
    `
			)
			.get(searchPattern) as { count: number };

		// Format response
		const formattedRepos = repos.map((repo) => {
			// Get images for this repository
			const images = ImageModel.getByRepositoryId(repo.id).map((image) => {
				// Get tags for this image
				const tags = TagModel.getByImageId(image.id).map((tag) => {
					// Get metadata for this tag
					const tagWithMeta = TagModel.getWithMetadata(tag.id);
					return {
						name: tag.name,
						digest: tag.digest,
						metadata: tagWithMeta?.metadata || {}
					};
				});

				return {
					name: image.name,
					fullName: image.fullName,
					tags
				};
			});

			return {
				name: repo.repoName,
				images
			};
		});

		return {
			repositories: formattedRepos,
			totalCount: countResult.count,
			page,
			limit
		};
	} catch (error) {
		logger.error('Failed to fetch repositories', error);
		throw error;
	}
}
