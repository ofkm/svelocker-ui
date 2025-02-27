// src/lib/services/db/models/repository.ts
import { db } from '../connection';
import type { RepositoryRecord, Repository } from '../types';

export const RepositoryModel = {
	// Create a new repository
	create(name: string): number {
		const stmt = db.prepare('INSERT INTO repositories (name) VALUES (?)');
		const result = stmt.run(name);
		return Number(result.lastInsertRowid);
	},

	// Get repository by ID
	getById(id: number): Repository | undefined {
		const repo = db.prepare('SELECT * FROM repositories WHERE id = ?').get(id) as RepositoryRecord | undefined;
		if (!repo) return undefined;

		return {
			id: repo.id,
			name: repo.name,
			lastSynced: new Date(repo.last_synced)
		};
	},

	// Get repository by name
	getByName(name: string): Repository | undefined {
		const repo = db.prepare('SELECT * FROM repositories WHERE name = ?').get(name) as RepositoryRecord | undefined;
		if (!repo) return undefined;

		return {
			id: repo.id,
			name: repo.name,
			lastSynced: new Date(repo.last_synced)
		};
	},

	// Get repository ID by name, create if it doesn't exist
	getOrCreate(name: string): { id: number; isNew: boolean } {
		const repo = this.getByName(name);
		if (repo) {
			return { id: repo.id, isNew: false };
		}

		const id = this.create(name);
		return { id, isNew: true };
	},

	// Get all repositories
	getAll(): Repository[] {
		const repos = db.prepare('SELECT * FROM repositories ORDER BY name').all() as RepositoryRecord[];

		return repos.map((repo) => ({
			id: repo.id,
			name: repo.name,
			lastSynced: new Date(repo.last_synced)
		}));
	},

	// Update last_synced timestamp
	updateLastSynced(id: number): void {
		// Use ISO string format for more consistent timestamp storage
		const now = new Date().toISOString();
		db.prepare('UPDATE repositories SET last_synced = ? WHERE id = ?').run(now, id);
	},

	// Delete repository
	delete(id: number): void {
		db.prepare('DELETE FROM repositories WHERE id = ?').run(id);
	},

	// Bulk delete repositories not in the provided list
	deleteNotIn(repoNames: string[]): number {
		if (repoNames.length === 0) return 0;

		// Convert array to SQL string format ('name1','name2',...)
		const placeholders = repoNames.map(() => '?').join(',');

		const result = db
			.prepare(
				`
			DELETE FROM repositories 
			WHERE name NOT IN (${placeholders})
		`
			)
			.run(...repoNames);

		return result.changes;
	},

	// Count repositories
	count(): number {
		return (db.prepare('SELECT COUNT(*) as count FROM repositories').get() as { count: number }).count;
	},

	// Clear all repositories
	clear(): void {
		db.prepare('DELETE FROM repositories').run();
	}
};

export default RepositoryModel;
