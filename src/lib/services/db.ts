// src/lib/services/db.ts
import Database from 'better-sqlite3';
import type { RegistryRepo } from '$lib/models/repo';
import { env } from '$env/dynamic/private';

const dbPath = env.DB_PATH || 'svelockerui.db';
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
    FOREIGN KEY(tag_id) REFERENCES tags(id)
  );
`);

export class RegistryCache {
	static async syncFromRegistry(registryData: RegistryRepo[]) {
		const stmt = db.prepare('INSERT INTO repositories (name) VALUES (?)');
		const insertImage = db.prepare('INSERT INTO images (repository_id, name, fullName) VALUES (?, ?, ?)');
		const insertTag = db.prepare('INSERT INTO tags (image_id, name, digest) VALUES (?, ?, ?)');
		const insertMetadata = db.prepare(`
            INSERT INTO tag_metadata (
                tag_id, created_at, os, architecture, author, 
                dockerFile, exposedPorts, totalSize, workDir, 
                command, description, contentDigest, entrypoint
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

		const transaction = db.transaction((repos: RegistryRepo[]) => {
			// Clear existing data
			db.prepare('DELETE FROM tag_metadata').run();
			db.prepare('DELETE FROM tags').run();
			db.prepare('DELETE FROM images').run();
			db.prepare('DELETE FROM repositories').run();

			for (const repo of repos) {
				const { lastInsertRowid: repoId } = stmt.run(repo.name);

				for (const image of repo.images) {
					const { lastInsertRowid: imageId } = insertImage.run(repoId, image.name, image.fullName);

					for (const tag of image.tags) {
						const { lastInsertRowid: tagId } = insertTag.run(imageId, tag.name, tag.metadata?.configDigest || null);

						// Insert metadata separately
						insertMetadata.run(tagId, tag.metadata?.created || null, tag.metadata?.os || null, tag.metadata?.architecture || null, tag.metadata?.author || null, tag.metadata?.dockerFile || null, JSON.stringify(tag.metadata?.exposedPorts) || null, tag.metadata?.totalSize || null, tag.metadata?.workDir || null, JSON.stringify(tag.metadata?.command) || null, tag.metadata?.description || null, tag.metadata?.contentDigest || null, JSON.stringify(tag.metadata?.entrypoint) || null);
					}
				}
			}
		});

		transaction(registryData);
	}

	static getRepositories(): RegistryRepo[] {
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
                                            'entrypoint', tm.entrypoint
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

// import Database from 'better-sqlite3';
// import type { RegistryRepo } from '$lib/models/repo';

// const db = new Database('svelockerui.db');

// // Initialize tables
// db.exec(`
//   CREATE TABLE IF NOT EXISTS repositories (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     last_synced DATETIME DEFAULT CURRENT_TIMESTAMP
//   );

//   CREATE TABLE IF NOT EXISTS images (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     repository_id INTEGER,
//     name TEXT NOT NULL,
//     fullName TEXT NOT NULL,
//     FOREIGN KEY(repository_id) REFERENCES repositories(id)
//   );

//   CREATE TABLE IF NOT EXISTS tags (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     image_id INTEGER,
//     name TEXT NOT NULL,
//     digest TEXT NOT NULL,
//     created_at DATETIME,
//     os TEXT,
//     architecture TEXT,
//     author TEXT,
//     dockerFile TEXT,
//     exposedPorts TEXT,
//     totalSize INTEGER,
//     workDir TEXT,
//     command TEXT,
//     description TEXT,
//     contentDigest TEXT,
//     entrypoint TEXT,
//     FOREIGN KEY(image_id) REFERENCES images(id)
//   );

// `);

// export class RegistryCache {
// 	static async syncFromRegistry(registryData: RegistryRepo[]) {
// 		const stmt = db.prepare('INSERT INTO repositories (name) VALUES (?)');
// 		const insertImage = db.prepare('INSERT INTO images (repository_id, name, fullName) VALUES (?, ?, ?)');
// 		const insertTag = db.prepare('INSERT INTO tags (image_id, name, digest, created_at, os, architecture, author, dockerFile, exposedPorts, totalSize, workDir, command, description, contentDigest, entrypoint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

// 		const transaction = db.transaction((repos: RegistryRepo[]) => {
// 			// Clear existing data
// 			db.prepare('DELETE FROM tags').run();
// 			db.prepare('DELETE FROM images').run();
// 			db.prepare('DELETE FROM repositories').run();

// 			for (const repo of repos) {
// 				const { lastInsertRowid } = stmt.run(repo.name);

// 				for (const image of repo.images) {
// 					const imageResult = insertImage.run(lastInsertRowid, image.name, image.fullName);

// 					for (const tag of image.tags) {
// 						insertTag.run(imageResult.lastInsertRowid, tag.name, tag.metadata?.configDigest || null, tag.metadata?.created || null, tag.metadata?.os || null, tag.metadata?.architecture || null, tag.metadata?.author || null, tag.metadata?.dockerFile || null, JSON.stringify(tag.metadata?.exposedPorts) || null, tag.metadata?.totalSize || null, tag.metadata?.workDir || null, JSON.stringify(tag.metadata?.command) || null, tag.metadata?.description || null, tag.metadata?.contentDigest || null, JSON.stringify(tag.metadata?.entrypoint) || null);
// 						// insertTag.run(imageResult.lastInsertRowid, tag.name, tag.metadata?.configDigest, tag.metadata?.created, tag.metadata?.os, tag.metadata?.architecture, tag.metadata?.author, tag.metadata?.dockerFile, tag.metadata?.exposedPorts, tag.metadata?.totalSize, tag.metadata?.workDir, tag.metadata?.command, tag.metadata?.description, tag.metadata?.contentDigest, tag.metadata?.entrypoint);
// 					}
// 				}
// 			}
// 		});

// 		transaction(registryData);
// 	}

// 	static getRepositories(): RegistryRepo[] {
// 		return db
// 			.prepare(
// 				`
//       SELECT
//         r.name as repoName,
//         json_group_array(
//           json_object(
//             'name', i.name,
//             'fullName', i.fullName,
//                         'tags', (
//                             SELECT json_group_array(
//                                 json_object(
//                                     'name', t.name,
//                                     'digest', t.digest,
//                                     'created', t.created_at,
//                                     'os', t.os,
//                                     'architecture', t.architecture,
//                                     'author', t.author,
//                                     'dockerFile', t.dockerFile,
//                                     'exposedPorts', t.exposedPorts,
//                                     'totalSize', t.totalSize,
//                                     'workDir', t.workDir,
//                                     'command', t.command,
//                                     'description', t.description,
//                                     'contentDigest', t.contentDigest,
//                                     'entrypoint', t.entrypoint
//                                 )
//                             )
//               FROM tags t
//               WHERE t.image_id = i.id
//             )
//           )
//         ) as images
//       FROM repositories r
//       LEFT JOIN images i ON i.repository_id = r.id
//       GROUP BY r.id
//     `
// 			)
// 			.all()
// 			.map((row) => ({
// 				name: row.repoName,
// 				fullName: row.repoFullName,
// 				images: JSON.parse(row.images)
// 			}));
// 	}
// }
