// src/lib/services/db/models/image.ts
import { db } from '../connection';
import type { ImageRecord, Image } from '../types';

export const ImageModel = {
	// Create a new image
	create(repositoryId: number, name: string, fullName: string): number {
		const stmt = db.prepare('INSERT INTO images (repository_id, name, fullName) VALUES (?, ?, ?)');
		const result = stmt.run(repositoryId, name, fullName);
		return Number(result.lastInsertRowid);
	},

	// Get image by ID
	getById(id: number): Image | undefined {
		const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id) as ImageRecord | undefined;
		if (!image) return undefined;

		return {
			id: image.id,
			repositoryId: image.repository_id,
			name: image.name,
			fullName: image.fullName,
			pullCount: image.pull_count
		};
	},

	clear(): void {
		db.prepare('DELETE FROM images').run();
	},

	// Get images by repository ID
	getByRepositoryId(repositoryId: number): Image[] {
		const images = db.prepare('SELECT * FROM images WHERE repository_id = ? ORDER BY name').all(repositoryId) as ImageRecord[];

		return images.map((image) => ({
			id: image.id,
			repositoryId: image.repository_id,
			name: image.name,
			fullName: image.fullName,
			pullCount: image.pull_count
		}));
	},

	// Find image by name in repository
	findByName(repositoryId: number, name: string): Image | undefined {
		const image = db.prepare('SELECT * FROM images WHERE repository_id = ? AND (name = ? OR fullName = ?)').get(repositoryId, name, name) as ImageRecord | undefined;

		if (!image) return undefined;

		return {
			id: image.id,
			repositoryId: image.repository_id,
			name: image.name,
			fullName: image.fullName,
			pullCount: image.pull_count
		};
	},

	// Increment pull count
	incrementPullCount(id: number): void {
		db.prepare('UPDATE images SET pull_count = pull_count + 1 WHERE id = ?').run(id);
	},

	// Delete image
	delete(id: number): void {
		db.prepare('DELETE FROM images WHERE id = ?').run(id);
	},

	// Count images in repository
	countByRepository(repositoryId: number): number {
		const result = db.prepare('SELECT COUNT(*) as count FROM images WHERE repository_id = ?').get(repositoryId) as { count: number };

		return result.count;
	}
};
