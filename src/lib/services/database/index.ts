// src/lib/services/db/index.ts
import { db } from './connection';
import { runMigrations, getDatabaseInfo, migrations } from './migrations';
import { RepositoryModel } from './models/repository';
import { ImageModel } from './models/image';
import { TagModel } from './models/tag';
import { Logger } from '$lib/services/logger';

// Import centralized types
import type { Repository, Image, Tag, TagMetadata, TagWithMetadata } from '$lib/types/db';
import type { RepositoryRecord, ImageRecord, TagRecord, TagMetadataRecord, TagWithMetadataRecord } from '$lib/types/db';
import type { RegistryRepo, RepoImage, ImageTag } from '$lib/types/api/registry';

const logger = Logger.getInstance('DBService');

export { db, RepositoryModel, ImageModel, TagModel, getDatabaseInfo };

// Initialize database
export async function initDatabase(): Promise<void> {
	await runMigrations();
	logger.info('Database initialized successfully');
}

// Helper function to sync images for a repository
function syncRepoImages(repoId: number, images: RepoImage[], stats: Record<string, number>): void {
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
			// Existing image - no need to update as images don't have changeable properties
			// except for tags which are handled separately
			imageId = existingImage.id;
		} else {
			// Create new image
			imageId = ImageModel.create(repoId, imageName, imageFullName);
			stats.addedImages++;

			// Since we added a new image, update repository last_synced
			RepositoryModel.updateLastSynced(repoId);
		}

		// Process tags for this image - pass repoId to allow updating last_synced
		syncImageTags(imageId, image.tags, stats, repoId);
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
function syncImageTags(imageId: number, tags: ImageTag[], stats: Record<string, number>, repoId: number): void {
	let changesDetected = false;

	try {
		// 1. Get existing tags
		const existingTags = TagModel.getByImageId(imageId);
		const existingTagMap = new Map(existingTags.map((tag) => [tag.name, tag]));

		// 2. Track tags found in the registry data
		const foundTagNames = new Set<string>();

		// 3. Process each tag
		for (const tag of tags) {
			foundTagNames.add(tag.name);

			// Fix the type issue - make sure we handle all potential undefined/null cases
			// Using type assertion to help TypeScript understand the structure
			const tagMetadata = tag.metadata as TagMetadata | undefined;
			const digest = tagMetadata?.configDigest || '';

			// Check if tag exists
			const existingTag = existingTagMap.get(tag.name);

			if (existingTag) {
				// Only update if the digest has changed
				const digestChanged = existingTag.digest !== digest;

				// Get metadata for existing tag
				const existingTagWithMeta = TagModel.getWithMetadata(existingTag.id);

				// Fix type issue with metadata comparison
				const metadataChanged = existingTagWithMeta?.metadata && tagMetadata && JSON.stringify(existingTagWithMeta.metadata) !== JSON.stringify(tagMetadata);

				if (digestChanged || metadataChanged) {
					try {
						// Update logic
						TagModel.delete(existingTag.id);
						const tagId = TagModel.create(imageId, tag.name, digest);

						// Make sure we handle the case where tag.metadata might be undefined
						if (tagMetadata) {
							TagModel.saveMetadata(tagId, tagMetadata);
						}
						stats.updatedTags++;

						// Mark that we detected changes
						changesDetected = true;
					} catch (error) {
						logger.error(`Error updating tag ${tag.name}:`, error);
					}
				}
			} else {
				try {
					// Create new tag
					const tagId = TagModel.create(imageId, tag.name, digest);

					// Save metadata if available - with type assertion for clarity
					if (tagMetadata) {
						TagModel.saveMetadata(tagId, tagMetadata);
					}
					stats.addedTags++;

					// Mark that we detected changes
					changesDetected = true;
				} catch (error) {
					logger.error(`Error creating tag ${tag.name}:`, error);
				}
			}
		}

		// 4. Remove tags that no longer exist in the registry
		for (const [tagName, tag] of existingTagMap) {
			if (!foundTagNames.has(tagName)) {
				try {
					TagModel.delete(tag.id);
					stats.removedTags++;

					// Mark that we detected changes
					changesDetected = true;
				} catch (error) {
					logger.error(`Error deleting tag ${tagName}:`, error);
				}
			}
		}

		// If any changes were detected, update the repository last_synced time
		if (changesDetected) {
			RepositoryModel.updateLastSynced(repoId);
		}
	} catch (mainError) {
		logger.error(`Error in syncImageTags for image ${imageId}:`, mainError);
	}
}

/**
 * Get detailed data for a specific repository
 * @param repoName Name of the repository to fetch
 * @returns Repository data with all images and tags
 */
export async function getRepositoryData(repoName: string): Promise<RegistryRepo | null> {
	try {
		logger.debug(`Fetching repository data for: ${repoName}`);

		// Find the repository by name
		const repo = db.prepare('SELECT id, name, last_synced FROM repositories WHERE name = ?').get(repoName) as RepositoryRecord | undefined;

		if (!repo) {
			logger.warn(`Repository not found: ${repoName}`);
			return null;
		}

		// Get all images for this repository using the ImageModel
		const images = ImageModel.getByRepositoryId(repo.id);

		// For each image, get all tags with their metadata
		const imagesWithTags = images.map((image) => {
			// Get tags for this image
			const tags = TagModel.getByImageId(image.id).map((tag) => {
				// Get metadata for this tag
				const tagWithMeta = TagModel.getWithMetadata(tag.id);

				return {
					id: tag.id,
					name: tag.name,
					digest: tag.digest,
					created: tag.createdAt,
					image_id: tag.imageId,
					metadata: tagWithMeta?.metadata || {}
				};
			});

			return {
				id: image.id,
				name: image.name,
				fullName: image.fullName,
				repository_id: image.repositoryId,
				tags
			};
		});

		// Return the complete repository data in the expected format
		return {
			id: repo.id,
			name: repo.name,
			lastSynced: repo.last_synced,
			images: imagesWithTags
		};
	} catch (error) {
		logger.error(`Failed to get repository data for ${repoName}:`, error);
		return null;
	}
}

// Query repositories with pagination and search
export async function getRepositories({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }): Promise<{
	repositories: RegistryRepo[];
	totalCount: number;
	page: number;
	limit: number;
}> {
	logger.debug(`Fetching repositories (page ${page}, limit ${limit}, search: ${search})`);

	try {
		// Search pattern
		const searchPattern = `%${search}%`;

		// Get paginated repositories using centralized types
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

		// Format response - ensure lastSynced is properly mapped
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
						// Fix the type mismatch by ensuring all required properties are present
						metadata: tagWithMeta?.metadata
							? {
									...tagWithMeta.metadata,
									// Add required properties with default values if missing
									configDigest: tagWithMeta.metadata.configDigest || tag.digest,
									created: tagWithMeta.metadata.created || '',
									os: tagWithMeta.metadata.os || 'unknown',
									architecture: tagWithMeta.metadata.architecture || 'unknown',
									dockerFile: tagWithMeta.metadata.dockerFile || '',
									exposedPorts: tagWithMeta.metadata.exposedPorts || [],
									totalSize: tagWithMeta.metadata.totalSize ? String(tagWithMeta.metadata.totalSize) : '0',
									workDir: tagWithMeta.metadata.workDir || '',
									command: tagWithMeta.metadata.command || '',
									description: tagWithMeta.metadata.description || '',
									contentDigest: tagWithMeta.metadata.contentDigest || '',
									entrypoint: tagWithMeta.metadata.entrypoint || '',
									indexDigest: tagWithMeta.metadata.indexDigest || '',
									isOCI: Boolean(tagWithMeta.metadata.isOCI)
								}
							: undefined
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
				lastSynced: repo.last_synced,
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
		return deltaSync(registryData);
	}

	// Check if there are pending migrations
	if (dbInfo.version < getLatestMigrationVersion()) {
		logger.info('Performing full sync due to schema version mismatch');
		return deltaSync(registryData);
	}

	// Otherwise, perform delta sync
	logger.info('Performing incremental delta sync');
	return deltaSync(registryData);
}

// Helper to get latest migration version
function getLatestMigrationVersion(): number {
	return migrations[migrations.length - 1].version;
}

// Define an interface for the settings result
interface SettingValue {
	value: string;
}

// Update the function to specify return type and parse the value
export function getLastSyncTime(): { value: number } | undefined {
	try {
		const result = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_time') as SettingValue | undefined;

		if (!result) {
			return undefined;
		}

		// Parse the string value to a number
		return {
			value: parseInt(result.value, 10)
		};
	} catch (error) {
		logger.error('Error getting last sync time:', error);
		return undefined;
	}
}

// Update the last sync time in the database
export function updateLastSyncTime(timestamp: number): void {
	try {
		const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
		stmt.run('last_sync_time', timestamp);
	} catch (error) {
		logger.error('Error updating last sync time:', error);
	}
}

// Delta sync implementation
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
				db.transaction(() => {
					const repoName = repo.name || 'library';
					foundRepoNames.add(repoName);

					// Check if repository exists
					let repoId: number;
					const existingRepo = existingRepoMap.get(repoName);

					if (existingRepo) {
						repoId = existingRepo.id;
						// Only update if needed (e.g., if last_synced needs updating)
						const needsUpdate = shouldUpdateRepo(existingRepo, repo);
						if (needsUpdate) {
							RepositoryModel.updateLastSynced(repoId);
							stats.updatedRepos++;
						}
					} else {
						// Create new repository
						repoId = RepositoryModel.create(repoName);
						stats.addedRepos++;
					}

					// Process images for this repository
					syncRepoImages(repoId, repo.images, stats);
				})();
			}

			// 4. Remove repositories that no longer exist in the registry
			if (registryData.length > 0) {
				const reposToRemove = existingRepos.filter((repo) => !foundRepoNames.has(repo.name));

				for (const repo of reposToRemove) {
					try {
						// Get all images for this repository
						const images = ImageModel.getByRepositoryId(repo.id);

						// For each image, delete all tags first
						for (const image of images) {
							const tags = TagModel.getByImageId(image.id);

							// Delete all tag metadata and tags
							for (const tag of tags) {
								// Tag metadata will be deleted by cascade constraint
								TagModel.delete(tag.id);
								stats.removedTags++;
							}

							// Now delete the image
							ImageModel.delete(image.id);
							stats.removedImages++;
						}

						// Finally, delete the repository
						RepositoryModel.delete(repo.id);
						stats.removedRepos++;
					} catch (error) {
						logger.error(`Error deleting repository ${repo.name}:`, error);
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

function shouldUpdateRepo(existingRepo: Repository, newRepo: RegistryRepo): boolean {
	// Define your criteria for updating repos
	// For example, update timestamp every N hours
	const lastSyncTime = new Date(existingRepo.lastSynced).getTime();
	const hoursSinceLastSync = (Date.now() - lastSyncTime) / (1000 * 60 * 60);
	return hoursSinceLastSync > 24; // Only update once per day
}

// Track sync status using centralized record types
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
		const lastSyncResult = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_time') as SettingValue | undefined;

		// Get counts
		const repoCount = RepositoryModel.count();
		const imageCount = db.prepare('SELECT COUNT(*) as count FROM images').get() as { count: number };
		const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get() as { count: number };

		// Get last sync duration
		const durationResult = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_duration') as SettingValue | undefined;

		// Get last error
		const lastErrorResult = db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_error') as SettingValue | undefined;

		return {
			lastSync: lastSyncResult?.value ? parseInt(lastSyncResult.value, 10) : null,
			duration: durationResult?.value ? parseInt(durationResult.value, 10) : null,
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
