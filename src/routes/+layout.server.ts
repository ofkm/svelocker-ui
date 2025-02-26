import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { checkRegistryHealth } from '$lib/utils/health';
import { initDatabase, syncFromRegistry } from '$lib/services/database';
import { db } from '$lib/services/database/connection';
// Import the mocks for testing
import { basicMock, searchMock, paginationMock, errorMock, emptyMock, tagDetailsMock, unhealthyStatus } from '../../tests/e2e/mocks.ts';

const logger = Logger.getInstance('LayoutServer');

// Min time between syncs (in milliseconds)
const MIN_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Store last sync time in memory (will reset on server restart)
let lastSyncTime = 0;

export async function load({ url }) {
	// Mock data for tests based on URL parameter
	if (process.env.PLAYWRIGHT === 'true') {
		const mockType = url.searchParams.get('mock');
		logger.debug('Using mock type:', mockType);

		switch (mockType) {
			case 'basic':
				return basicMock;

			case 'search':
				return searchMock;

			case 'pagination':
				return paginationMock;

			case 'error':
				return errorMock;

			case 'empty':
				return emptyMock;

			case 'unhealthy':
				return {
					repos: { repositories: [] },
					error: null,
					healthStatus: unhealthyStatus
				};

			case 'tagDetails':
				return tagDetailsMock;

			default:
				// For default case, return a simple mock
				return basicMock;
		}
	}

	try {
		// Initialize database (runs migrations if needed)
		await initDatabase();

		// Check if we need to create the settings table
		ensureSettingsTable();

		// Get last sync time from DB
		const lastSyncSetting = getLastSyncTime();
		const currentTime = Date.now();

		// Determine if sync is needed based on time elapsed
		const needsSync = !lastSyncSetting || currentTime - lastSyncSetting.value > MIN_SYNC_INTERVAL;

		// Check registry health
		const healthStatus = await checkRegistryHealth(env.PUBLIC_REGISTRY_URL);

		if (healthStatus.isHealthy && needsSync) {
			logger.info('Syncing registry data - time since last sync: ' + (lastSyncSetting ? formatTimeDiff(currentTime - lastSyncSetting.value) : 'never'));

			// Fetch registry data
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');

			// Sync to database
			await syncFromRegistry(registryData.repositories);

			// Update last sync time in both memory and DB
			lastSyncTime = currentTime;
			updateLastSyncTime(currentTime);

			logger.info('Registry data synced to database');
		} else if (!needsSync) {
			logger.info('Skipping registry sync - last sync was ' + formatTimeDiff(currentTime - (lastSyncSetting?.value || 0)) + ' ago');
		}

		return {
			healthStatus
		};
	} catch (error) {
		logger.error('Failed to initialize data', error);
		return {
			error: true,
			healthStatus: {
				isHealthy: false
			}
		};
	}
}

// Ensure the settings table exists
function ensureSettingsTable() {
	const tableExists = db
		.prepare(
			`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='settings'
  `
		)
		.get();

	if (!tableExists) {
		db.prepare(
			`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL
      )
    `
		).run();
		logger.info('Settings table created');
	}
}

// Get the last sync time from the database
function getLastSyncTime() {
	try {
		return db.prepare('SELECT value FROM settings WHERE key = ?').get('last_sync_time');
	} catch (error) {
		logger.error('Error getting last sync time:', error);
		return null;
	}
}

// Update the last sync time in the database
function updateLastSyncTime(timestamp: number) {
	try {
		const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
		stmt.run('last_sync_time', timestamp);
	} catch (error) {
		logger.error('Error updating last sync time:', error);
	}
}

// Format time difference for logging
function formatTimeDiff(diffMs: number): string {
	if (diffMs < 1000) return `${diffMs}ms`;
	if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
	if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
	return `${Math.round(diffMs / 3600000)}h`;
}
