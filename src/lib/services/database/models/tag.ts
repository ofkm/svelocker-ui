// src/lib/services/db/models/tag.ts
import { db } from '../connection';
import type { TagRecord, Tag, TagMetadata, TagWithMetadata } from '../types';

export const TagModel = {
	// Create a new tag
	create(imageId: number, name: string, digest: string): number {
		const stmt = db.prepare('INSERT INTO tags (image_id, name, digest) VALUES (?, ?, ?)');
		const result = stmt.run(imageId, name, digest);
		return Number(result.lastInsertRowid);
	},

	// Get tag by ID
	getById(id: number): Tag | undefined {
		const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as TagRecord | undefined;
		if (!tag) return undefined;

		return {
			id: tag.id,
			imageId: tag.image_id,
			name: tag.name,
			digest: tag.digest
		};
	},

	// Get tags by image ID
	getByImageId(imageId: number): Tag[] {
		// Fix: Use quotes around 'latest' string literal
		const tags = db.prepare("SELECT * FROM tags WHERE image_id = ? ORDER BY name = 'latest' DESC, name").all(imageId) as TagRecord[];

		return tags.map((tag) => ({
			id: tag.id,
			imageId: tag.image_id,
			name: tag.name,
			digest: tag.digest
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
			.get(tagId);

		if (!result) return undefined;

		// Parse JSON fields and format data
		return {
			id: result.id,
			imageId: result.image_id,
			name: result.name,
			digest: result.digest,
			metadata: {
				created: result.created_at,
				os: result.os,
				architecture: result.architecture,
				author: result.author,
				dockerFile: result.dockerFile,
				exposedPorts: parseJSON(result.exposedPorts, []),
				totalSize: result.totalSize,
				workDir: result.workDir,
				command: parseCommandOrEntrypoint(result.command),
				description: result.description,
				contentDigest: result.contentDigest,
				entrypoint: parseCommandOrEntrypoint(result.entrypoint),
				isOCI: Boolean(result.isOCI),
				indexDigest: result.indexDigest
			}
		};
	},

	// Delete tag
	delete(id: number): void {
		db.prepare('DELETE FROM tags WHERE id = ?').run(id);
	},

	// Delete tag by digest
	deleteByDigest(digest: string): void {
		db.prepare('DELETE FROM tags WHERE digest = ?').run(digest);
	},

	// Count tags in image
	countByImage(imageId: number): number {
		const result = db.prepare('SELECT COUNT(*) as count FROM tags WHERE image_id = ?').get(imageId) as { count: number };

		return result.count;
	},

	clear(): void {
		db.prepare('DELETE FROM tag_metadata').run();
		db.prepare('DELETE FROM tags').run();
	}
};

// Helper function to parse JSON safely
function parseJSON<T>(str: string | null, defaultValue: T): T {
	if (!str) return defaultValue;
	try {
		return JSON.parse(str);
	} catch (e) {
		return defaultValue;
	}
}

// Helper to parse command/entrypoint
function parseCommandOrEntrypoint(value: string | null): string | string[] | null {
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
