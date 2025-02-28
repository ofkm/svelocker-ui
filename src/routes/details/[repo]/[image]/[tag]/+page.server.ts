import { error } from '@sveltejs/kit';
import { db } from '$lib/services/database/connection';
import { Logger } from '$lib/services/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const logger = Logger.getInstance('TagDetails');

	// Check for Playwright test mode
	const isPlaywrightTest = process.env.PLAYWRIGHT === 'true';

	try {
		// Extract params
		const { repo: repoName, image: imageName, tag: tagName } = params;

		logger.info(`Loading details for ${repoName}/${imageName}:${tagName}`);

		// Query the database directly instead of loading all repositories
		// First find the repository
		let repository = db
			.prepare(
				`
            SELECT id, name 
            FROM repositories 
            WHERE name = ?
        `
			)
			.get(repoName);

		if (!repository) {
			// Try library namespace as fallback for root-level images
			const libraryRepo = db
				.prepare(
					`
                SELECT id, name 
                FROM repositories 
                WHERE name = 'library'
            `
				)
				.get();

			if (!libraryRepo) {
				logger.error(`Repository ${repoName} not found`);
				throw error(404, `Repository ${repoName} not found`);
			}

			repository = libraryRepo;
		}

		// Find the image within the repo
		const image = db
			.prepare(
				`
            SELECT id, name, fullName
            FROM images
            WHERE repository_id = ? AND (name = ? OR fullName = ? OR fullName = ?)
        `
			)
			.get(repository.id, imageName, `${repoName}/${imageName}`, imageName);

		if (!image) {
			logger.error(`Image ${imageName} not found in ${repoName}`);
			throw error(404, `Image ${imageName} not found in ${repoName}`);
		}

		// Get all tags for this image
		const tags = db
			.prepare(
				`
            SELECT t.id, t.name, t.digest,
                tm.created_at, tm.os, tm.architecture, tm.author, 
                tm.dockerFile, tm.exposedPorts, tm.totalSize, tm.workDir,
                tm.command, tm.description, tm.contentDigest,
                tm.entrypoint, tm.isOCI, tm.indexDigest
            FROM tags t
            LEFT JOIN tag_metadata tm ON tm.tag_id = t.id
            WHERE t.image_id = ?
            ORDER BY t.name = 'latest' DESC, t.name ASC
        `
			)
			.all(image.id);

		// Find the specific tag
		const tagIndex = tags.findIndex((t) => t.name === tagName);

		if (tagIndex === -1) {
			logger.error(`Tag ${tagName} not found for ${repoName}/${imageName}`);
			throw error(404, `Tag ${tagName} not found for ${repoName}/${imageName}`);
		}

		// Process the tags to match the expected format
		const formattedTags = tags.map((tag) => ({
			name: tag.name,
			metadata: {
				created: tag.created_at,
				os: tag.os,
				architecture: tag.architecture,
				author: tag.author,
				dockerFile: tag.dockerFile,
				exposedPorts: tag.exposedPorts ? JSON.parse(tag.exposedPorts) : [],
				totalSize: tag.totalSize,
				workDir: tag.workDir,
				command: tag.command ? (tag.command.startsWith('[') ? JSON.parse(tag.command) : tag.command) : null,
				description: tag.description,
				contentDigest: tag.contentDigest,
				entrypoint: tag.entrypoint ? (tag.entrypoint.startsWith('[') ? JSON.parse(tag.entrypoint) : tag.entrypoint) : null,
				isOCI: tag.isOCI === 1,
				indexDigest: tag.indexDigest
			}
		}));

		const isLatest = tagName === 'latest';

		// Return minimal data
		return {
			repo: repoName,
			imageName: image.name,
			imageFullName: image.fullName,
			tag: {
				name: image.name,
				fullName: image.fullName,
				tags: formattedTags
			},
			tagIndex,
			isLatest
		};
	} catch (e) {
		// Handle unexpected errors
		if (e && typeof e === 'object' && 'status' in e && 'body' in e) {
			// This is an error thrown by the error() helper
			throw e;
		} else {
			logger.error('Error loading tag details:', e);
			throw error(500, 'Failed to load image details');
		}
	}
};
