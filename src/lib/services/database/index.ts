// src/lib/services/db/index.ts
import { db } from './connection';
import { runMigrations, getDatabaseInfo, migrations } from './migrations'; // Add migrations here
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

// Sync registry data to database - delta approach
export async function syncFromRegistry(registryData: RegistryRepo[]): Promise<void> {
	logger.info(`Starting delta sync for ${registryData.length} repositories`);

	try {
		// Use transaction for better performance and atomicity
		db.transaction(() => {
			// Track stats for logging
			const stats = {
				addedRepos: 0,
				updatedRepos: 0,
				removedRepos: 0,
				addedImages: 0,
				updatedImages: 0,
				removedImages: 0,
				addedTags: 0,
				updatedTags: 0,
				removedTags: 0
			};

			// 1. Get existing repositories
			const existingRepos = RepositoryModel.getAll();
			const existingRepoMap = new Map(existingRepos.map((r) => [r.name, r]));

			// 2. Track repositories found in the registry data
			const foundRepoNames = new Set<string>();

			// 3. Process each repository
			for (const repo of registryData) {
				const repoName = repo.name || 'library';
				foundRepoNames.add(repoName);

				// Check if repository exists
				let repoId: number;
				const existingRepo = existingRepoMap.get(repoName);

				if (existingRepo) {
					// Update existing repository
					repoId = existingRepo.id;
					RepositoryModel.updateLastSynced(repoId);
					stats.updatedRepos++;
				} else {
					// Create new repository
					repoId = RepositoryModel.create(repoName);
					stats.addedRepos++;
				}

				// Process images for this repository
				syncRepoImages(repoId, repo.images, stats);
			}

			// 4. Remove repositories that no longer exist in the registry
			// Only if we have a complete registry dataset
			if (registryData.length > 0) {
				for (const [repoName, repo] of existingRepoMap) {
					if (!foundRepoNames.has(repoName)) {
						RepositoryModel.delete(repo.id);
						stats.removedRepos++;
					}
				}
			}

			logger.info(`Delta sync stats: ` + `Repositories: +${stats.addedRepos} ~${stats.updatedRepos} -${stats.removedRepos}, ` + `Images: +${stats.addedImages} ~${stats.updatedImages} -${stats.removedImages}, ` + `Tags: +${stats.addedTags} ~${stats.updatedTags} -${stats.removedTags}`);
		})();

		logger.info('Registry data synchronized successfully (delta sync)');
	} catch (error) {
		logger.error('Failed to sync registry data', error);
		throw error;
	}
}

// Helper function to sync images for a repository
function syncRepoImages(repoId: number, images: { name: string; fullName: string; tags: any[] }[], stats: any): void {
	// 1. Get existing images
	const existingImages = ImageModel.getByRepositoryId(repoId);
	const existingImageMap = new Map(existingImages.map((img) => [img.fullName, img]));

	// 2. Track images found in the registry data
	const foundImageNames = new Set<string>();

	// 3. Process each image
	for (const image of images) {
		const imageName = image.name || image.fullName.split('/').pop() || '';
		const imageFullName = image.fullName;
		foundImageNames.add(imageFullName);

		// Check if image exists
		let imageId: number;
		const existingImage = existingImageMap.get(imageFullName);

		if (existingImage) {
			// Update existing image
			imageId = existingImage.id;
			stats.updatedImages++;
		} else {
			// Create new image
			imageId = ImageModel.create(repoId, imageName, imageFullName);
			stats.addedImages++;
		}

		// Process tags for this image
		syncImageTags(imageId, image.tags, stats);
	}

	// 4. Remove images that no longer exist in the registry
	for (const [imageFullName, image] of existingImageMap) {
		if (!foundImageNames.has(imageFullName)) {
			ImageModel.delete(image.id);
			stats.removedImages++;
		}
	}
}

// Helper function to sync tags for an image
function syncImageTags(imageId: number, tags: { name: string; digest: string; metadata?: any }[], stats: any): void {
	// 1. Get existing tags
	const existingTags = TagModel.getByImageId(imageId);
	const existingTagMap = new Map(existingTags.map((tag) => [tag.name, tag]));

	// 2. Track tags found in the registry data
	const foundTagNames = new Set<string>();

	// 3. Process each tag
	for (const tag of tags) {
		foundTagNames.add(tag.name);

		// Get digest (default to empty if not available)
		const digest = tag.metadata?.configDigest || tag.digest || '';

		// Check if tag exists
		const existingTag = existingTagMap.get(tag.name);

		if (existingTag) {
			// Only update if the digest has changed
			if (existingTag.digest !== digest) {
				// Delete the old tag and create a new one
				// This ensures related metadata is properly updated
				TagModel.delete(existingTag.id);
				const tagId = TagModel.create(imageId, tag.name, digest);

				// Update metadata if available
				if (tag.metadata) {
					TagModel.saveMetadata(tagId, tag.metadata);
				}
				stats.updatedTags++;
			}
		} else {
			// Create new tag
			const tagId = TagModel.create(imageId, tag.name, digest);

			// Save metadata if available
			if (tag.metadata) {
				TagModel.saveMetadata(tagId, tag.metadata);
			}
			stats.addedTags++;
		}
	}

	// 4. Remove tags that no longer exist in the registry
	for (const [tagName, tag] of existingTagMap) {
		if (!foundTagNames.has(tagName)) {
			TagModel.delete(tag.id);
			stats.removedTags++;
		}
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

// Option to perform incremental synchronization
export async function incrementalSync(registryData: RegistryRepo[], options = { forceFullSync: false }): Promise<void> {
	const dbInfo = getDatabaseInfo();
	const repoCount = RepositoryModel.count();

	// Use full sync if:
	// 1. Database is empty
	// 2. Force full sync is requested
	// 3. Version mismatch detected
	if (repoCount === 0 || options.forceFullSync) {
		logger.info('Performing full sync (empty DB or forced sync)');
		return syncFromRegistry(registryData);
	}

	// Check if there are pending migrations
	// Using non-async function now
	if (dbInfo.version < getLatestMigrationVersion()) {
		logger.info('Performing full sync due to schema version mismatch');
		return syncFromRegistry(registryData);
	}

	// Otherwise, perform delta sync
	logger.info('Performing incremental delta sync');
	return deltaSync(registryData);
}

// Helper to get latest migration version - simplify this function
function getLatestMigrationVersion(): number {
	return migrations[migrations.length - 1].version;
}

// Delta sync implementation (renamed from previous syncFromRegistry)
async function deltaSync(registryData: RegistryRepo[]): Promise<void> {
	logger.info(`Starting delta sync for ${registryData.length} repositories`);

	try {
		// Use transaction for better performance and atomicity
		db.transaction(() => {
			// Track stats for logging
			const stats = {
				addedRepos: 0,
				updatedRepos: 0,
				removedRepos: 0,
				addedImages: 0,
				updatedImages: 0,
				removedImages: 0,
				addedTags: 0,
				updatedTags: 0,
				removedTags: 0
			};

			// 1. Get existing repositories
			const existingRepos = RepositoryModel.getAll();
			const existingRepoMap = new Map(existingRepos.map((r) => [r.name, r]));

			// 2. Track repositories found in the registry data
			const foundRepoNames = new Set<string>();

			// 3. Process each repository
			for (const repo of registryData) {
				const repoName = repo.name || 'library';
				foundRepoNames.add(repoName);

				// Check if repository exists
				let repoId: number;
				const existingRepo = existingRepoMap.get(repoName);

				if (existingRepo) {
					// Update existing repository
					repoId = existingRepo.id;
					RepositoryModel.updateLastSynced(repoId);
					stats.updatedRepos++;
				} else {
					// Create new repository
					repoId = RepositoryModel.create(repoName);
					stats.addedRepos++;
				}

				// Process images for this repository
				syncRepoImages(repoId, repo.images, stats);
			}

			// 4. Remove repositories that no longer exist in the registry
			// Only if we have a complete registry dataset
			if (registryData.length > 0) {
				for (const [repoName, repo] of existingRepoMap) {
					if (!foundRepoNames.has(repoName)) {
						RepositoryModel.delete(repo.id);
						stats.removedRepos++;
					}
				}
			}

			logger.info(`Delta sync stats: ` + `Repositories: +${stats.addedRepos} ~${stats.updatedRepos} -${stats.removedRepos}, ` + `Images: +${stats.addedImages} ~${stats.updatedImages} -${stats.removedImages}, ` + `Tags: +${stats.addedTags} ~${stats.updatedTags} -${stats.removedTags}`);
		})();

		logger.info('Registry data synchronized successfully (delta sync)');
	} catch (error) {
		logger.error('Failed to sync registry data', error);
		throw error;
	}
}

// Track sync status
export function getSyncStatus(): {
	lastSync: number | null;
	duration: number | null;
	repoCount: number;
	imageCount: number;
	tagCount: number;
	lastError: string | null;
} {
	try {
		// Get last sync time
		const lastSyncResult = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_time') as { value: number } | undefined;

		// Get counts
		const repoCount = RepositoryModel.count();
		const imageCount = db.prepare('SELECT COUNT(*) as count FROM images').get() as { count: number };
		const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get() as { count: number };

		// Get last sync duration
		const durationResult = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_duration') as { value: number } | undefined;

		// Get last error
		const lastErrorResult = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_error') as { value: string } | undefined;

		return {
			lastSync: lastSyncResult?.value || null,
			duration: durationResult?.value || null,
			repoCount,
			imageCount: imageCount.count,
			tagCount: tagCount.count,
			lastError: lastErrorResult?.value || null
		};
	} catch (error) {
		logger.error('Error getting sync status:', error);
		return {
			lastSync: null,
			duration: null,
			repoCount: 0,
			imageCount: 0,
			tagCount: 0,
			lastError: error instanceof Error ? error.message : String(error)
		};
	}
}
