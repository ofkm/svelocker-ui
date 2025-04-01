import { error } from '@sveltejs/kit';
import { db } from '$lib/services/database/connection';
import { Logger } from '$lib/services/logger';
import type { PageServerLoad } from './$types';
import type { TagMetadata, Image, Repository, TagWithMetadata, Tag } from '$lib/types/db';
import { parseJSON, parseCommandOrEntrypoint } from '$lib/services/database/models/tag';

// Create a proper interface for the database query result
interface TagQueryResult {
	id: number;
	name: string;
	digest: string;
	image_id?: number; // From tags table
	created_at?: string;
	os?: string;
	architecture?: string;
	author?: string;
	dockerFile?: string;
	exposedPorts?: string;
	totalSize?: number;
	workDir?: string;
	command?: string;
	description?: string;
	contentDigest?: string;
	entrypoint?: string;
	isOCI?: number; // SQLite stores boolean as 0/1
	indexDigest?: string;
	layers?: string; // JSON string of layer data
}

export const load: PageServerLoad = async ({ params, url }) => {
	const logger = Logger.getInstance('TagDetails');

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
			.get(repoName) as Repository;

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
				.get() as Repository;

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
			.get(repository.id, imageName, `${repoName}/${imageName}`, imageName) as Image;

		if (!image) {
			logger.error(`Image ${imageName} not found in ${repoName}`);
			throw error(404, `Image ${imageName} not found in ${repoName}`);
		}

		// Get all tags for this image
		const dbTags = db
			.prepare(
				`
            SELECT t.id, t.name, t.digest, t.image_id,
                tm.created_at, tm.os, tm.architecture, tm.author, 
                tm.dockerFile, tm.exposedPorts, tm.totalSize, tm.workDir,
                tm.command, tm.description, tm.contentDigest,
                tm.entrypoint, tm.isOCI, tm.indexDigest, tm.layers
            FROM tags t
            LEFT JOIN tag_metadata tm ON tm.tag_id = t.id
            WHERE t.image_id = ?
            ORDER BY t.name = 'latest' DESC, t.name ASC
        `
			)
			.all(image.id) as TagQueryResult[];

		// Transform the raw database results into TagWithMetadata objects
		const tags: TagWithMetadata[] = dbTags.map((row: TagQueryResult) => {
			const tag: TagWithMetadata = {
				id: row.id,
				imageId: row.image_id || image.id, // Use image.id as fallback
				name: row.name,
				digest: row.digest
			};

			// Only add metadata if the row contains metadata information
			if (row.created_at || row.os || row.architecture || row.author || row.dockerFile || row.exposedPorts || row.totalSize || row.workDir || row.command || row.description || row.contentDigest || row.entrypoint || row.isOCI !== undefined || row.indexDigest || row.layers) {
				tag.metadata = {
					created: row.created_at || undefined,
					os: row.os || undefined,
					architecture: row.architecture || undefined,
					author: row.author || undefined,
					dockerFile: row.dockerFile || undefined,
					exposedPorts: row.exposedPorts ? parseJSON(row.exposedPorts, []) : [],
					totalSize: row.totalSize || undefined,
					workDir: row.workDir || undefined,
					command: row.command ? parseCommandOrEntrypoint(row.command) : null,
					description: row.description || undefined,
					contentDigest: row.contentDigest || undefined,
					entrypoint: row.entrypoint ? parseCommandOrEntrypoint(row.entrypoint) : null,
					isOCI: row.isOCI !== undefined ? Boolean(row.isOCI) : undefined,
					indexDigest: row.indexDigest || undefined,
					layers: row.layers ? parseJSON(row.layers, []) : [] // Parse the layers JSON
				};
			}

			return tag;
		});

		// Find the tag index
		const tagIndex = tags.findIndex((t) => t.name === tagName);

		// Format the tags for the response, safely accessing the metadata
		const formattedTags = tags.map((tag) => ({
			name: tag.name,
			metadata: tag.metadata || {} // Use empty object as fallback
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
