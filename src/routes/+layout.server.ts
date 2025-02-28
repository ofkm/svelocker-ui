import { Logger } from '$lib/services/logger';
import { env } from '$env/dynamic/public';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { checkRegistryHealth } from '$lib/utils/api/health';
import { initDatabase, syncFromRegistry, incrementalSync } from '$lib/services/database';
import { db } from '$lib/services/database/connection';
import { runMigrations } from '$lib/services/database/migrations.ts';
import { getLastSyncTime, updateLastSyncTime } from '$lib/services/database';
import { MIN_SYNC_INTERVAL } from '$lib/utils/constants';

const logger = Logger.getInstance('LayoutServer');

export async function load({ url }) {
	// Proceed with regular functionality for non-test environments
	try {
		// Initialize database (runs migrations if needed)
		await initDatabase();
		await runMigrations();

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

			// Use incremental sync instead of full sync
			const forceFullSync = url.searchParams.has('fullSync');
			await incrementalSync(registryData.repositories, { forceFullSync });

			// Update last sync time in both memory and DB
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

// Format time difference for logging
function formatTimeDiff(diffMs: number): string {
	if (diffMs < 1000) return `${diffMs}ms`;
	if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
	if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
	return `${Math.round(diffMs / 3600000)}h`;
}
