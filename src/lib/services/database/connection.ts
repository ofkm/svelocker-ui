// src/lib/services/db/connection.ts
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('DBConnection');

function sqlLogger(sql: string): void {
	logger.debug(`SQL: ${sql}`);
}

// Database configuration
const DB_CONFIG = {
	path: env.DB_PATH || 'data/svelockerui.db',
	journalMode: 'WAL', // Write-Ahead Logging for better concurrency
	timeout: 5000 // Connection timeout in ms
};

// Ensure data directory exists
function ensureDirExists(filePath: string): void {
	const dirname = path.dirname(filePath);
	if (!fs.existsSync(dirname)) {
		fs.mkdirSync(dirname, { recursive: true });
	}
}

// Reset database function
function resetDatabase(dbPath: string): void {
	logger.info('Resetting incompatible database');

	try {
		// Back up existing database first
		if (fs.existsSync(dbPath)) {
			const backupPath = `${dbPath}.backup-${Date.now()}`;
			fs.copyFileSync(dbPath, backupPath);
			logger.info(`Backed up incompatible database to ${backupPath}`);

			// Close existing connections (if any)
			try {
				const existingDb = new Database(dbPath);
				existingDb.close();
			} catch (e) {
				// Ignore errors here, we're going to delete the file anyway
			}

			// Delete database files (including WAL and SHM)
			fs.unlinkSync(dbPath);
			if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
			if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);

			logger.info('Incompatible database files removed');
		}
	} catch (error) {
		logger.error('Failed to reset database:', error);
		throw error;
	}
}

// Check if schema is compatible with our code
function isSchemaCompatible(database: Database.Database): boolean {
	try {
		// Check if schema_version table exists
		const hasSchemaVersionTable = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'").get();

		if (!hasSchemaVersionTable) {
			logger.warn('Database missing schema_version table');
			return false;
		}

		// We no longer need to check for specific columns in schema_version
		// as we handle that in the migration process

		// Check for required tables
		const requiredTables = ['repositories', 'images', 'tags', 'tag_metadata'];
		for (const table of requiredTables) {
			const tableExists = database.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`).get();

			if (!tableExists) {
				logger.warn(`Database missing ${table} table`);
				return false;
			}
		}

		// If we get here, the schema seems compatible enough for us to migrate it properly
		return true;
	} catch (error) {
		logger.error('Error checking schema compatibility:', error);
		return false;
	}
}

// Create and configure database connection
function createConnection(): Database.Database {
	try {
		ensureDirExists(DB_CONFIG.path);

		// Check if the database file exists but is incompatible
		if (fs.existsSync(DB_CONFIG.path)) {
			try {
				// Try opening the database
				const testDb = new Database(DB_CONFIG.path);

				// Check if it's compatible with our schema
				if (!isSchemaCompatible(testDb)) {
					// Close connection before reset
					testDb.close();
					resetDatabase(DB_CONFIG.path);
					logger.info('Database reset due to incompatible schema');
				} else {
					// Close the test connection
					testDb.close();
				}
			} catch (error) {
				// If there's an error opening the database, it's likely corrupt
				logger.error('Error opening existing database, resetting:', error);
				resetDatabase(DB_CONFIG.path);
			}
		}

		// Now create the actual database connection
		const database = new Database(DB_CONFIG.path, {
			verbose: sqlLogger
		});

		// Configure database
		database.pragma(`journal_mode = ${DB_CONFIG.journalMode}`);
		database.pragma('foreign_keys = ON');

		return database;
	} catch (error) {
		console.error(`Failed to create database connection: ${error}`);
		throw error;
	}
}

// Singleton database instance
export const db = createConnection();

// Close database on process exit
process.on('exit', () => {
	db.close();
});
