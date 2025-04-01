import { db } from '../connection';
import type { TagRecord, TagWithMetadataRecord, Tag, TagMetadata, TagWithMetadata } from '$lib/types/db';

// Define count result interface
interface CountResult {
	count: number;
}

// Helper function to parse JSON safely - moved to the top to avoid circular imports
export function parseJSON<T>(str: string | null, defaultValue: T): T {
	if (!str) return defaultValue;
	try {
		return JSON.parse(str);
	} catch (e) {
		console.error('Error parsing JSON:', e);
		console.debug('Failed to parse:', str);
		return defaultValue;
	}
}

// Helper to parse command/entrypoint
export function parseCommandOrEntrypoint(value: string | null): string | string[] | null {
	if (!value) return null;
	if (value.startsWith('[')) {
		try {
			return JSON.parse(value);
		} catch (e) {
			return null;
		}
	}
	return value;
}

export class TagModel {
	// Create a new tag
	static create(imageId: number, name: string, digest: string): number {
		const stmt = db.prepare('INSERT INTO tags (image_id, name, digest) VALUES (?, ?, ?)');
		const result = stmt.run(imageId, name, digest);
		return Number(result.lastInsertRowid);
	}

	// Get tag by ID
	static getById(id: number): Tag | null {
		const result = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as TagRecord | undefined;

		if (!result) {
			return null;
		}

		return {
			id: result.id,
			imageId: result.image_id,
			name: result.name,
			digest: result.digest,
			createdAt: new Date(result.created_at)
		};
	}

	// Get tags by image ID
	static getByImageId(imageId: number): Tag[] {
		const results = db.prepare("SELECT * FROM tags WHERE image_id = ? ORDER BY name = 'latest' DESC, name").all(imageId) as TagRecord[];

		return results.map((result) => ({
			id: result.id,
			imageId: result.image_id,
			name: result.name,
			digest: result.digest,
			createdAt: new Date(result.created_at)
		}));
	}

	// Find tag by name in image
	static findByName(imageId: number, name: string): Tag | undefined {
		const tag = db.prepare('SELECT * FROM tags WHERE image_id = ? AND name = ?').get(imageId, name) as TagRecord | undefined;

		if (!tag) return undefined;

		return {
			id: tag.id,
			imageId: tag.image_id,
			name: tag.name,
			digest: tag.digest
		};
	}

	// Save tag metadata
	static saveMetadata(tagId: number, metadata: TagMetadata): void {
		const stmt = db.prepare(`
      INSERT INTO tag_metadata (
        tag_id, created_at, os, architecture, author, 
        dockerFile, exposedPorts, totalSize, workDir, 
        command, description, contentDigest, entrypoint, isOCI, indexDigest, layers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

		// Handle JSON serialization
		const exposedPorts = Array.isArray(metadata.exposedPorts) ? JSON.stringify(metadata.exposedPorts) : '[]';
		const command = typeof metadata.command === 'string' ? metadata.command : JSON.stringify(metadata.command || null);
		const entrypoint = typeof metadata.entrypoint === 'string' ? metadata.entrypoint : JSON.stringify(metadata.entrypoint || null);

		// Convert boolean to number (SQLite doesn't have boolean)
		const isOCI = metadata.isOCI === true ? 1 : 0;

		// Serialize layers to JSON string with validation
		const layers = Array.isArray(metadata.layers) ? JSON.stringify(metadata.layers) : '[]';

		stmt.run(tagId, metadata.created, metadata.os, metadata.architecture, metadata.author, metadata.dockerFile, exposedPorts, metadata.totalSize, metadata.workDir, command, metadata.description, metadata.contentDigest, entrypoint, isOCI, metadata.indexDigest, layers);
	}

	// Get tag with metadata
	static getWithMetadata(tagId: number): TagWithMetadata | undefined {
		const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId) as TagRecord | undefined;

		if (!tag) return undefined;

		const metadata = db.prepare('SELECT * FROM tag_metadata WHERE tag_id = ?').get(tagId) as TagWithMetadataRecord | undefined;

		if (!metadata) {
			return {
				id: tag.id,
				imageId: tag.image_id,
				name: tag.name,
				digest: tag.digest,
				createdAt: new Date(tag.created_at)
			};
		}

		const parsedLayers = parseJSON(metadata.layers, []);

		return {
			id: tag.id,
			imageId: tag.image_id,
			name: tag.name,
			digest: tag.digest,
			createdAt: new Date(tag.created_at),
			metadata: {
				created: metadata.created_at,
				os: metadata.meta_os,
				architecture: metadata.meta_architecture,
				author: metadata.meta_author,
				dockerFile: metadata.meta_dockerFile,
				exposedPorts: parseJSON(metadata.meta_exposedPorts, []),
				totalSize: metadata.meta_totalSize,
				workDir: metadata.meta_workDir,
				command: metadata.meta_command,
				description: metadata.meta_description,
				contentDigest: metadata.meta_contentDigest,
				entrypoint: metadata.meta_entrypoint,
				indexDigest: metadata.meta_indexDigest,
				isOCI: metadata.meta_isOCI === 1,
				layers: parsedLayers // Using the parsed and debugged value
			}
		};
	}

	// Delete tag
	static delete(id: number): void {
		// First delete the metadata
		try {
			db.prepare('DELETE FROM tag_metadata WHERE tag_id = ?').run(id);
		} catch (error) {
			// Continue even if metadata doesn't exist or fails
		}

		// Then delete the tag itself
		db.prepare('DELETE FROM tags WHERE id = ?').run(id);
	}

	// Delete tag by digest
	static deleteByDigest(digest: string): void {
		db.prepare('DELETE FROM tags WHERE digest = ?').run(digest);
	}

	// Count tags in image
	static countByImage(imageId: number): number {
		const result = db.prepare('SELECT COUNT(*) as count FROM tags WHERE image_id = ?').get(imageId) as CountResult;

		return result.count;
	}

	static clear(): void {
		db.prepare('DELETE FROM tag_metadata').run();
		db.prepare('DELETE FROM tags').run();
	}
}
