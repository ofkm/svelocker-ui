// src/lib/services/db.ts
import Database from 'better-sqlite3';
import type { RegistryRepo } from '$lib/types/repo';
import { env } from '$env/dynamic/private';

const dbPath = env.DB_PATH || 'data/svelockerui.db';
const db = new Database(dbPath);

// Initialize tables with new tag_metadata table
db.exec(`
  CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    last_synced DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER,
    name TEXT NOT NULL,
    fullName TEXT NOT NULL,
    FOREIGN KEY(repository_id) REFERENCES repositories(id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER,
    name TEXT NOT NULL,
    digest TEXT NOT NULL,
    FOREIGN KEY(image_id) REFERENCES images(id)
  );

  CREATE TABLE IF NOT EXISTS tag_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_id INTEGER,
    created_at DATETIME,
    os TEXT,
    architecture TEXT,
    author TEXT,
    dockerFile TEXT,
    exposedPorts TEXT,
    totalSize INTEGER,
    workDir TEXT,
    command TEXT,
    description TEXT,
    contentDigest TEXT,
    entrypoint TEXT,
    isOCI BOOLEAN,
    indexDigest TEXT,
    FOREIGN KEY(tag_id) REFERENCES tags(id)
  );

  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
  );
`);

export class RegistryCache {
	private static migrated = false;

	private static migrateSchema() {
		if (RegistryCache.migrated) return;

		try {
			// Check if schema_version table exists and create if not
			db.exec(`
				CREATE TABLE IF NOT EXISTS schema_version (
					version INTEGER PRIMARY KEY
				);
			`);

			interface SchemaVersion {
				version: number;
			}
			const currentVersion = (db.prepare('SELECT version FROM schema_version').get() as SchemaVersion)?.version || 0;

			if (currentVersion < 1) {
				// For new databases, we don't need to add columns since they're in the initial CREATE TABLE
				// Just update the schema version
				db.exec(`
					INSERT OR REPLACE INTO schema_version (version) VALUES (1);
				`);
			}

			RegistryCache.migrated = true;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to migrate database schema: ${errorMessage}`);
		}
	}

	static async syncFromRegistry(registryData: RegistryRepo[]) {
		// Run migrations first
		this.migrateSchema();

		const stmt = db.prepare('INSERT INTO repositories (name) VALUES (?)');
		const insertImage = db.prepare('INSERT INTO images (repository_id, name, fullName) VALUES (?, ?, ?)');
		const insertTag = db.prepare('INSERT INTO tags (image_id, name, digest) VALUES (?, ?, ?)');

		// Fix: Store boolean and JSON data properly
		const insertMetadata = db.prepare(`
			INSERT INTO tag_metadata (
				tag_id, created_at, os, architecture, author, 
				dockerFile, exposedPorts, totalSize, workDir, 
				command, description, contentDigest, entrypoint, isOCI, indexDigest
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		const transaction = db.transaction((repos: RegistryRepo[]) => {
			// Clear existing data
			db.prepare('DELETE FROM tag_metadata').run();
			db.prepare('DELETE FROM tags').run();
			db.prepare('DELETE FROM images').run();
			db.prepare('DELETE FROM repositories').run();

			for (const repo of repos) {
				// Use 'library' for root-level images
				const repoName = repo.name || 'library';
				const { lastInsertRowid: repoId } = stmt.run(repoName);

				for (const image of repo.images) {
					const imageName = image.name || image.fullName.split('/').pop() || '';
					const { lastInsertRowid: imageId } = insertImage.run(repoId, imageName, image.fullName);

					for (const tag of image.tags) {
						const { lastInsertRowid: tagId } = insertTag.run(imageId, tag.name, tag.metadata?.configDigest || null);

						// Fix: Convert arrays/objects to JSON strings, booleans to 0/1
						const exposedPorts = Array.isArray(tag.metadata?.exposedPorts) ? JSON.stringify(tag.metadata.exposedPorts) : '[]';

						const command = typeof tag.metadata?.command === 'string' ? tag.metadata.command : JSON.stringify(tag.metadata?.command || null);

						const entrypoint = typeof tag.metadata?.entrypoint === 'string' ? tag.metadata.entrypoint : JSON.stringify(tag.metadata?.entrypoint || null);

						// Convert boolean to number (SQLite doesn't have a true boolean type)
						const isOCI = tag.metadata?.isOCI === true ? 1 : 0;

						// Insert metadata with proper type conversions
						insertMetadata.run(tagId, tag.metadata?.created || null, tag.metadata?.os || null, tag.metadata?.architecture || null, tag.metadata?.author || null, tag.metadata?.dockerFile || null, exposedPorts, tag.metadata?.totalSize || null, tag.metadata?.workDir || null, command, tag.metadata?.description || null, tag.metadata?.contentDigest || null, entrypoint, isOCI, tag.metadata?.indexDigest || null);
					}
				}
			}
		});

		transaction(registryData);
	}

	static getRepositories(): RegistryRepo[] {
		// Run migrations first
		this.migrateSchema();

		return db
			.prepare(
				`
					SELECT 
						r.name as repoName,
						json_group_array(
							json_object(
								'name', i.name,
								'fullName', i.fullName,
								'tags', (
									SELECT json_group_array(
										json_object(
											'name', t.name,
											'digest', t.digest,
											'metadata', (
												SELECT json_object(
													'created', tm.created_at,
													'os', tm.os,
													'architecture', tm.architecture,
													'author', tm.author,
													'dockerFile', tm.dockerFile,
													'exposedPorts', json(CASE WHEN tm.exposedPorts IS NULL THEN '[]' ELSE tm.exposedPorts END),
													'totalSize', tm.totalSize,
													'workDir', tm.workDir,
													'command', tm.command,
													'description', tm.description,
													'contentDigest', tm.contentDigest,
													'entrypoint', tm.entrypoint,
													'isOCI', CASE WHEN tm.isOCI = 1 THEN 'true' ELSE 'false' END,
													'indexDigest', tm.indexDigest
												)
												FROM tag_metadata tm
												WHERE tm.tag_id = t.id
											)
										)
									)
									FROM tags t
									WHERE t.image_id = i.id
								)
							)
						) as images
					FROM repositories r
					LEFT JOIN images i ON i.repository_id = r.id
					GROUP BY r.id
					`
			)
			.all()
			.map((row) => ({
				name: row.repoName,
				images: JSON.parse(row.images)
			}));
	}
}
