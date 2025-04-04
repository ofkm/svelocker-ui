import { db } from './connection';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('AppConfig');

// Config table name
const CONFIG_TABLE = 'app_config';

// Initialize the config table if it doesn't exist
function initConfigTable(): void {
	try {
		db.exec(`
      CREATE TABLE IF NOT EXISTS ${CONFIG_TABLE} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
		logger.debug('App config table initialized');
	} catch (error) {
		logger.error('Failed to initialize app config table:', error);
		throw error;
	}
}

// Initialize table on module load
initConfigTable();

// Type definitions for database results
type ConfigRow = { value: string };
type ConfigKeyValue = { key: string; value: string };

// Prepared statements
const getConfigStmt = db.prepare(`SELECT value FROM ${CONFIG_TABLE} WHERE key = ?`);
const getAllConfigStmt = db.prepare(`SELECT key, value FROM ${CONFIG_TABLE}`);
const setConfigStmt = db.prepare(`INSERT OR REPLACE INTO ${CONFIG_TABLE} (key, value, updated_at) VALUES (?, ?, ?)`);
const deleteConfigStmt = db.prepare(`DELETE FROM ${CONFIG_TABLE} WHERE key = ?`);
const deleteAllConfigStmt = db.prepare(`DELETE FROM ${CONFIG_TABLE}`);

/**
 * Get a configuration value by key
 * @param key The configuration key
 * @param defaultValue Default value if key doesn't exist
 * @returns The configuration value or default
 */
export function getConfigValue(key: string, defaultValue: string = ''): string {
	try {
		const config = getConfigStmt.get(key) as ConfigRow | undefined;
		return config ? config.value : defaultValue;
	} catch (error) {
		logger.error(`Error getting config value for key ${key}:`, error);
		return defaultValue;
	}
}

/**
 * Set a configuration value
 * @param key The configuration key
 * @param value The configuration value
 */
export function setConfigValue(key: string, value: string): void {
	try {
		const timestamp = Date.now();
		setConfigStmt.run(key, value, timestamp);
		logger.debug(`Config value for key ${key} set to ${value}`);
	} catch (error) {
		logger.error(`Error setting config value for key ${key}:`, error);
		throw error;
	}
}

/**
 * Get all configuration values
 * @returns Array of configuration objects
 */
export function getAllConfig(): ConfigKeyValue[] {
	try {
		return getAllConfigStmt.all() as ConfigKeyValue[];
	} catch (error) {
		logger.error('Error getting all config values:', error);
		return [];
	}
}

/**
 * Delete a configuration value
 * @param key The configuration key
 */
export function deleteConfigValue(key: string): void {
	try {
		deleteConfigStmt.run(key);
		logger.debug(`Config value for key ${key} deleted`);
	} catch (error) {
		logger.error(`Error deleting config value for key ${key}:`, error);
		throw error;
	}
}

/**
 * Reset all configuration values to defaults
 */
export function resetAllConfig(): void {
	try {
		deleteAllConfigStmt.run();
		logger.debug('All config values reset to defaults');
	} catch (error) {
		logger.error('Error resetting all config values:', error);
		throw error;
	}
}

// Default configuration values
const DEFAULT_CONFIG = {
	sync_interval: '5'
	// Add more default config here as needed
};

/**
 * Initialize default config values if not already set
 */
export function initDefaultConfig(): void {
	try {
		Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => {
			// Only set if the key doesn't exist
			const existingValue = getConfigStmt.get(key) as ConfigRow | undefined;
			if (!existingValue) {
				setConfigValue(key, value);
			}
		});
		logger.debug('Default config values initialized');
	} catch (error) {
		logger.error('Error initializing default config values:', error);
	}
}

// Initialize default config on module load
initDefaultConfig();
