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
		db.prepare('UPDATE repositories SET last_synced = CURRENT_TIMESTAMP WHERE id = ?').run(id);
	},

	// Delete repository
	delete(id: number): void {
		db.prepare('DELETE FROM repositories WHERE id = ?').run(id);
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
