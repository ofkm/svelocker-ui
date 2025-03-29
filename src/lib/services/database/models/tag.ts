import { db } from '../connection';
import type { TagRecord, TagWithMetadataRecord, Tag, TagMetadata, TagWithMetadata } from '$lib/types/db';

// Define count result interface
interface CountResult {
	count: number;
}

export const TagModel = {
	// Create a new tag
	create(imageId: number, name: string, digest: string): number {
		const stmt = db.prepare('INSERT INTO tags (image_id, name, digest) VALUES (?, ?, ?)');
		const result = stmt.run(imageId, name, digest);
		return Number(result.lastInsertRowid);
	},

	// Get tag by ID
	getById(id: number): Tag | null {
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
	},

	// Get tags by image ID
	getByImageId(imageId: number): Tag[] {
		const results = db.prepare("SELECT * FROM tags WHERE image_id = ? ORDER BY name = 'latest' DESC, name").all(imageId) as TagRecord[];

		return results.map((result) => ({
			id: result.id,
			imageId: result.image_id,
			name: result.name,
			digest: result.digest,
			createdAt: new Date(result.created_at)
		}));
	},

	// Find tag by name in image
	findByName(imageId: number, name: string): Tag | undefined {
		const tag = db.prepare('SELECT * FROM tags WHERE image_id = ? AND name = ?').get(imageId, name) as TagRecord | undefined;

		if (!tag) return undefined;

		return {
			id: tag.id,
			imageId: tag.image_id,
			name: tag.name,
			digest: tag.digest
		};
	},

	// Save tag metadata
	saveMetadata(tagId: number, metadata: TagMetadata): void {
		const stmt = db.prepare(`
      INSERT INTO tag_metadata (
        tag_id, created_at, os, architecture, author, 
        dockerFile, exposedPorts, totalSize, workDir, 
        command, description, contentDigest, entrypoint, isOCI, indexDigest
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

		// Handle JSON serialization
		const exposedPorts = Array.isArray(metadata.exposedPorts) ? JSON.stringify(metadata.exposedPorts) : '[]';

		const command = typeof metadata.command === 'string' ? metadata.command : JSON.stringify(metadata.command || null);

		const entrypoint = typeof metadata.entrypoint === 'string' ? metadata.entrypoint : JSON.stringify(metadata.entrypoint || null);

		// Convert boolean to number (SQLite doesn't have boolean)
		const isOCI = metadata.isOCI === true ? 1 : 0;

		stmt.run(tagId, metadata.created, metadata.os, metadata.architecture, metadata.author, metadata.dockerFile, exposedPorts, metadata.totalSize, metadata.workDir, command, metadata.description, metadata.contentDigest, entrypoint, isOCI, metadata.indexDigest);
	},

	// Get tag with metadata
	getWithMetadata(tagId: number): TagWithMetadata | undefined {
		const result = db
			.prepare(
				`
        SELECT 
          t.id, t.image_id, t.name, t.digest,
          tm.created_at, tm.os, tm.architecture, tm.author, tm.dockerFile,
          tm.exposedPorts, tm.totalSize, tm.workDir, tm.command,
          tm.description, tm.contentDigest, tm.entrypoint, tm.isOCI, tm.indexDigest
        FROM tags t
        LEFT JOIN tag_metadata tm ON tm.tag_id = t.id
        WHERE t.id = ?
      `
			)
			.get(tagId) as TagWithMetadataRecord | undefined;

		if (!result) return undefined;

		// Parse JSON fields and format data
		return {
			id: result.id,
			imageId: result.image_id,
			name: result.name,
			digest: result.digest,
			metadata: {
				created: result.created_at || undefined,
				os: result.meta_os || undefined,
				architecture: result.meta_architecture || undefined,
				author: result.meta_author || undefined,
				dockerFile: result.meta_dockerFile || undefined,
				exposedPorts: result.meta_exposedPorts ? parseJSON(result.meta_exposedPorts, []) : [],
				totalSize: result.meta_totalSize || undefined,
				workDir: result.meta_workDir || undefined,
				command: result.meta_command ? parseCommandOrEntrypoint(result.meta_command) : null,
				description: result.meta_description || undefined,
				contentDigest: result.meta_contentDigest || undefined,
				entrypoint: result.meta_entrypoint ? parseCommandOrEntrypoint(result.meta_entrypoint) : null,
				isOCI: result.meta_isOCI ? Boolean(result.meta_isOCI) : undefined,
				indexDigest: result.meta_indexDigest || undefined
			}
		};
	},

	// Delete tag
	delete(id: number): void {
		// First delete the metadata
		try {
			db.prepare('DELETE FROM tag_metadata WHERE tag_id = ?').run(id);
		} catch (error) {
			// Continue even if metadata doesn't exist or fails
		}

		// Then delete the tag itself
		db.prepare('DELETE FROM tags WHERE id = ?').run(id);
	},

	// Delete tag by digest
	deleteByDigest(digest: string): void {
		db.prepare('DELETE FROM tags WHERE digest = ?').run(digest);
	},

	// Count tags in image
	countByImage(imageId: number): number {
		const result = db.prepare('SELECT COUNT(*) as count FROM tags WHERE image_id = ?').get(imageId) as CountResult;

		return result.count;
	},

	clear(): void {
		db.prepare('DELETE FROM tag_metadata').run();
		db.prepare('DELETE FROM tags').run();
	}
};

// Helper function to parse JSON safely
export function parseJSON<T>(str: string | null, defaultValue: T): T {
	if (!str) return defaultValue;
	try {
		return JSON.parse(str);
	} catch (e) {
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
