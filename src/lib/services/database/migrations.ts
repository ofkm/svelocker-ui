// src/lib/services/db/migrations.ts
import { db } from './connection';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('DBMigrations');

interface Migration {
	version: number;
	description: string;
	sql: string;
}

// Array of migrations (ordered by version)
export const migrations: Migration[] = [
	{
		version: 1,
		description: 'Initial schema',
		sql: `
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
        FOREIGN KEY(repository_id) REFERENCES repositories(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_id INTEGER,
        name TEXT NOT NULL,
        digest TEXT NOT NULL,
        FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE
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
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
      
      -- Create schema_version table with all needed columns from the start
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        description TEXT,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_repository_name ON repositories(name);
      CREATE INDEX IF NOT EXISTS idx_image_repo_id ON images(repository_id);
      CREATE INDEX IF NOT EXISTS idx_tag_image_id ON tags(image_id);
      CREATE INDEX IF NOT EXISTS idx_tag_metadata_tag_id ON tag_metadata(tag_id);
    `
	},
	{
		version: 2,
		description: 'Add pull count to images',
		sql: `
      ALTER TABLE images ADD COLUMN pull_count INTEGER DEFAULT 0;
    `
	},
	{
		version: 3,
		description: 'Add settings table',
		sql: `
		  CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value INTEGER NOT NULL
		  );
		`
	},
	{
		version: 4,
		description: 'Add fullName index to images for faster lookups',
		sql: `
	  CREATE INDEX IF NOT EXISTS idx_image_fullname ON images(fullName);
	`
	},
	{
		version: 5,
		description: 'Add layer information to tag_metadata',
		sql: `
      ALTER TABLE tag_metadata ADD COLUMN layers TEXT DEFAULT '[]';
    `
	},
	{
		version: 6,
		description: 'Update settings table to accept string values',
		sql: `
      -- Create a temporary table with the correct structure
      CREATE TABLE settings_new (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      
      -- Copy data from the old table, converting INTEGER to TEXT
      INSERT INTO settings_new SELECT key, CAST(value AS TEXT) FROM settings;
      
      -- Drop the old table
      DROP TABLE settings;
      
      -- Rename the new table to the original name
      ALTER TABLE settings_new RENAME TO settings;
    `
	},
	{
		version: 7,
		description: 'Add app_config table',
		sql: `
      CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `
	}
	// Add more migrations as your schema evolves
];

// Run migrations
export async function runMigrations(): Promise<void> {
	logger.info('Starting database migrations');

	try {
		// Check if schema_version table exists with the right structure
		const hasSchemaVersionTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'").get();

		if (!hasSchemaVersionTable) {
			// Create schema_version table with all needed columns initially
			logger.info('Creating schema_version table with proper structure');
			db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          description TEXT,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
		} else {
			// Check if columns exist
			const columns = db.prepare('PRAGMA table_info(schema_version)').all() as { name: string }[];
			const columnNames = columns.map((col) => col.name);

			// Check if schema needs to be reset due to incompatibility
			if (!columnNames.includes('description') || !columnNames.includes('applied_at')) {
				logger.warn('Schema version table has incompatible structure. Dropping and recreating it.');

				// Backup current versions
				const versions = db.prepare('SELECT version FROM schema_version').all() as { version: number }[];

				// Drop and recreate table with proper structure
				db.exec(`
          DROP TABLE schema_version;
          CREATE TABLE schema_version (
            version INTEGER PRIMARY KEY,
            description TEXT,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

				// Reinsert versions with new schema
				for (const ver of versions) {
					const migration = migrations.find((m) => m.version === ver.version);
					const desc = migration?.description || 'Unknown migration';

					db.prepare(
						`
            INSERT INTO schema_version (version, description) 
            VALUES (?, ?)
          `
					).run(ver.version, desc);
				}
			}
		}

		// Get current schema version
		const currentVersion = db.prepare('SELECT COALESCE(MAX(version), 0) as version FROM schema_version').get() as { version: number };

		// Apply pending migrations
		db.transaction(() => {
			for (const migration of migrations) {
				if (migration.version > currentVersion.version) {
					logger.info(`Applying migration v${migration.version}: ${migration.description}`);

					// Apply the migration
					db.exec(migration.sql);

					// Record migration
					db.prepare('INSERT INTO schema_version (version, description) VALUES (?, ?)').run(migration.version, migration.description);

					logger.debug(`Migration v${migration.version} applied successfully`);
				}
			}
		})();

		logger.info('Migrations completed successfully');
	} catch (error) {
		logger.error('Migration failed:', error);
		throw new Error(`Failed to run migrations: ${error instanceof Error ? error.message : String(error)}`);
	}
}

// Get database information
export function getDatabaseInfo(): {
	version: number;
	lastMigration: string;
	size: number;
	tables: { name: string; rowCount: number }[];
} {
	try {
		const version = db.prepare('SELECT COALESCE(MAX(version), 0) as version FROM schema_version').get() as { version: number };

		// Check if schema_version table has the required columns
		const columns = db.prepare('PRAGMA table_info(schema_version)').all() as { name: string }[];
		const columnNames = columns.map((col) => col.name);

		let lastMigration = { description: 'None', date: 'Never' };

		// Only try to get description if the column exists
		if (columnNames.includes('description') && columnNames.includes('applied_at')) {
			try {
				lastMigration =
					(db
						.prepare(
							`
          SELECT description, datetime(applied_at) as date
          FROM schema_version
          ORDER BY version DESC LIMIT 1
        `
						)
						.get() as { description: string; date: string }) || lastMigration;
			} catch (e) {
				// If there's any error, just use the default values
			}
		} else if (columnNames.includes('description')) {
			try {
				const desc = (db
					.prepare(
						`
          SELECT description
          FROM schema_version
          ORDER BY version DESC LIMIT 1
        `
					)
					.get() as { description: string }) || { description: 'None' };

				lastMigration = { description: desc.description, date: 'Unknown date' };
			} catch (e) {
				// If there's any error, just use the default values
			}
		} else {
			const ver = (db
				.prepare(
					`
        SELECT version
        FROM schema_version
        ORDER BY version DESC LIMIT 1
      `
				)
				.get() as { version: number }) || { version: 0 };

			lastMigration = { description: `Version ${ver.version}`, date: 'Unknown date' };
		}

		// Fix: Get database size using individual PRAGMA statements
		const pageSize = db.pragma('page_size', { simple: true }) as number;
		const pageCount = db.pragma('page_count', { simple: true }) as number;
		const size = pageSize * pageCount;

		// Get table information
		const tables = db
			.prepare(
				`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `
			)
			.all() as { name: string }[];

		const tablesWithCount = tables.map((table) => {
			try {
				const count = db.prepare(`SELECT COUNT(*) as count FROM "${table.name}"`).get() as { count: number };
				return {
					name: table.name,
					rowCount: count.count
				};
			} catch (error) {
				// Handle tables that might have issues
				return {
					name: table.name,
					rowCount: -1 // Indicate error counting rows
				};
			}
		});

		return {
			version: version.version,
			lastMigration: `${lastMigration.description} (${lastMigration.date})`,
			size,
			tables: tablesWithCount
		};
	} catch (error) {
		logger.error('Error getting database info:', error);
		return {
			version: 0,
			lastMigration: 'Error retrieving data',
			size: 0,
			tables: []
		};
	}
}
