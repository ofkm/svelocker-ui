// src/lib/services/db.ts
import Database from 'better-sqlite3';
import type { RegistryRepo } from '$lib/models/repo';
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
	private static migrateSchema() {
		const currentVersion = db.prepare('SELECT version FROM schema_version').get()?.version || 0;

		if (currentVersion < 1) {
			// Add new columns
			db.exec(`
        ALTER TABLE tag_metadata ADD COLUMN isOCI BOOLEAN;
        ALTER TABLE tag_metadata ADD COLUMN indexDigest TEXT;
        
        -- Update schema version
        INSERT OR REPLACE INTO schema_version (version) VALUES (1);
      `);
		}
	}

	static async syncFromRegistry(registryData: RegistryRepo[]) {
		// Run migrations first
		this.migrateSchema();

		const stmt = db.prepare('INSERT INTO repositories (name) VALUES (?)');
		const insertImage = db.prepare('INSERT INTO images (repository_id, name, fullName) VALUES (?, ?, ?)');
		const insertTag = db.prepare('INSERT INTO tags (image_id, name, digest) VALUES (?, ?, ?)');
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

						// Insert metadata separately
						insertMetadata.run(tagId, tag.metadata?.created || null, tag.metadata?.os || null, tag.metadata?.architecture || null, tag.metadata?.author || null, tag.metadata?.dockerFile || null, JSON.stringify(tag.metadata?.exposedPorts) || null, tag.metadata?.totalSize || null, tag.metadata?.workDir || null, JSON.stringify(tag.metadata?.command) || null, tag.metadata?.description || null, tag.metadata?.contentDigest || null, JSON.stringify(tag.metadata?.entrypoint) || null, JSON.stringify(tag.metadata?.isOCI) || null, JSON.stringify(tag.metadata?.indexDigest) || null);
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
                                            'exposedPorts', tm.exposedPorts,
                                            'totalSize', tm.totalSize,
                                            'workDir', tm.workDir,
                                            'command', tm.command,
                                            'description', tm.description,
                                            'contentDigest', tm.contentDigest,
                                            'entrypoint', tm.entrypoint,
                                            'isOCI', tm.isOCI,
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
