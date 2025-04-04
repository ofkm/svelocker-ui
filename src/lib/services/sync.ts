import cron from 'node-cron';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { incrementalSync } from '$lib/services/database';
import { db } from '$lib/services/database/connection';
import { getLastSyncTime, updateLastSyncTime } from '$lib/services/database';
import { env } from '$env/dynamic/public';
import { Logger } from '$lib/services/logger';
import { getConfigValue } from '$lib/services/database/app-config';

// Helper to convert interval setting to milliseconds
function getMillisecondsFromInterval(intervalMinutes: string): number {
	const minutes = parseInt(intervalMinutes, 10);
	if (isNaN(minutes) || minutes <= 0) {
		return 5 * 60 * 1000; // Default to 5 minutes
	}
	return minutes * 60 * 1000;
}

export class RegistrySyncService {
	private static instance: RegistrySyncService;
	private cronJob: cron.ScheduledTask | null = null;
	private logger: Logger;
	private isSyncing: boolean = false;
	private isStarted: boolean = false;

	private constructor() {
		this.logger = Logger.getInstance('RegistrySync');
	}

	// This is the function called by the cron job
	private async scheduledSyncCheck(): Promise<void> {
		if (this.isSyncing) {
			this.logger.debug('Scheduled check skipped: sync already in progress.');
			return;
		}

		const lastSyncSetting = getLastSyncTime();
		const currentTime = Date.now();

		// Get interval from DB setting *every time*
		const syncIntervalSetting = getConfigValue('sync_interval', '5');
		const syncIntervalMs = getMillisecondsFromInterval(syncIntervalSetting);

		const needsSync = !lastSyncSetting || currentTime - lastSyncSetting.value > syncIntervalMs;

		if (needsSync) {
			this.logger.info(`Scheduled sync triggered (interval: ${syncIntervalMs}ms).`);
			try {
				await this.performSync();
			} catch (error) {
				// performSync already logs errors, but catch here just in case
				this.logger.error('Error during scheduled performSync:', error);
			}
		} else {
			this.logger.debug(`Scheduled check: Sync not needed (interval: ${syncIntervalMs}ms). Last sync: ${lastSyncSetting ? new Date(lastSyncSetting.value).toISOString() : 'never'}`);
		}
	}

	private async performSync(): Promise<void> {
		if (this.isSyncing) {
			// This check might be redundant if scheduledSyncCheck handles it, but keep for safety
			this.logger.warn('performSync called while sync already in progress, skipping...');
			return;
		}

		this.isSyncing = true;
		const startTime = Date.now();
		this.logger.info('Starting registry sync...');

		try {
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
			await incrementalSync(registryData.repositories, { forceFullSync: false });

			// Update sync statistics in the database
			try {
				// Note: table creation check here might be less critical if init runs first
				const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get();
				if (!tableCheck) {
					db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`).run();
					this.logger.info('Created settings table during sync'); // Log if needed
				}

				const duration = Date.now() - startTime;
				const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
				stmt.run('last_sync_time', Date.now().toString());
				stmt.run('last_sync_duration', duration.toString());
				db.prepare('DELETE FROM settings WHERE key = ?').run('last_sync_error');
			} catch (error) {
				this.logger.error('Error updating sync statistics:', error);
			}

			this.logger.info(`Registry sync completed successfully in ${Date.now() - startTime}ms`);
		} catch (error) {
			this.logger.error('Registry sync failed', error);
			try {
				db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('last_sync_error', error instanceof Error ? error.message : String(error));
			} catch (dbError) {
				this.logger.error('Failed to record sync error in database:', dbError);
			}
		} finally {
			this.isSyncing = false;
		}
	}

	// Removed syncIfNeeded method as its logic is now in scheduledSyncCheck

	public static getInstance(): RegistrySyncService {
		if (!RegistrySyncService.instance) {
			RegistrySyncService.instance = new RegistrySyncService();
		}
		return RegistrySyncService.instance;
	}

	public start(): void {
		if (this.isStarted) {
			this.logger.warn('Service already started, skipping...');
			return;
		}

		if (this.cronJob) {
			this.stop();
		}

		// Schedule the check to run every minute
		const cronPattern = '* * * * *';
		this.cronJob = cron.schedule(cronPattern, () => {
			// No need for async here as the check itself handles awaits
			this.scheduledSyncCheck();
		});

		if (this.cronJob) {
			this.cronJob.start();
			this.isStarted = true;
			// Log the check frequency, not a specific interval based on startup setting
			this.logger.info(`Registry sync service started. Check schedule: ${cronPattern}`);
		}
	}

	public stop(): void {
		if (this.cronJob) {
			this.cronJob.stop();
			this.cronJob = null;
			this.isStarted = false;
			this.logger.info('Registry sync service stopped');
		}
	}

	public async syncNow(forceFullSync: boolean = false): Promise<void> {
		if (this.isSyncing) {
			this.logger.warn('Sync already in progress, skipping manual sync request');
			return;
		}

		// Call performSync directly for manual trigger
		// isSyncing flag is set within performSync
		this.logger.info(`Starting manual registry sync (forceFullSync=${forceFullSync})...`);
		try {
			await this.performSync(); // Pass forceFullSync if performSync needs it (it currently doesn't directly)
			// If performSync needs the flag, modify its signature and pass it:
			// await this.performSync(forceFullSync);
		} catch (error) {
			// performSync handles its own errors and logging
			this.logger.error('Error during manual syncNow call to performSync:', error); // Log if needed
		}
	}
}
