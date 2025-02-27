import cron from 'node-cron';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { incrementalSync } from '$lib/services/database'; // Change to use incrementalSync
import { db } from '$lib/services/database/connection';
import { env } from '$env/dynamic/public';
import { Logger } from '$lib/services/logger';

export class RegistrySyncService {
	private static instance: RegistrySyncService;
	private cronJob: cron.ScheduledTask | null = null;
	private logger: Logger;
	private isSyncing: boolean = false;
	private isStarted: boolean = false;

	private constructor() {
		this.logger = Logger.getInstance('RegistrySync');
		// Run every 5 minutes by default
		this.cronJob = cron.schedule('*/5 * * * *', async () => {
			try {
				await this.performSync();
			} catch (error) {
				this.logger.error('Registry sync failed:', error);
			}
		});
	}

	private async performSync(): Promise<void> {
		if (this.isSyncing) {
			this.logger.warn('Sync already in progress, skipping...');
			return;
		}

		this.isSyncing = true;
		const startTime = Date.now();
		this.logger.info('Starting registry sync...');

		try {
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');

			// Use the incremental sync function instead of full sync
			await incrementalSync(registryData.repositories, { forceFullSync: false });

			// Update sync statistics in the database
			try {
				// Check if settings table exists
				const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get();

				if (!tableCheck) {
					// Create settings table if it doesn't exist
					db.prepare(
						`
            CREATE TABLE IF NOT EXISTS settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            )
          `
					).run();
					this.logger.info('Created settings table');
				}

				// Calculate duration
				const duration = Date.now() - startTime;

				// Update sync statistics
				const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
				stmt.run('last_sync_time', Date.now().toString());
				stmt.run('last_sync_duration', duration.toString());

				// Clear any previous error
				db.prepare('DELETE FROM settings WHERE key = ?').run('last_sync_error');
			} catch (error) {
				this.logger.error('Error updating sync statistics:', error);
			}

			this.logger.info(`Registry sync completed successfully in ${Date.now() - startTime}ms`);
		} catch (error) {
			this.logger.error('Registry sync failed', error);

			// Record the error
			try {
				db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('last_sync_error', error instanceof Error ? error.message : String(error));
			} catch (dbError) {
				this.logger.error('Failed to record sync error in database:', dbError);
			}
		} finally {
			this.isSyncing = false;
		}
	}

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
			this.cronJob.start();
			this.isStarted = true;
			this.logger.info('Registry sync service started with schedule: */5 * * * *');
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

		// Store the current forceFullSync value for this sync operation
		this.isSyncing = true;
		const startTime = Date.now();

		try {
			this.logger.info(`Starting manual registry sync (forceFullSync=${forceFullSync})...`);

			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');

			// Use incremental sync with the forced flag if specified
			await incrementalSync(registryData.repositories, { forceFullSync });

			// Update sync statistics
			const duration = Date.now() - startTime;
			db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('last_sync_time', Date.now().toString());
			db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('last_sync_duration', duration.toString());
			db.prepare('DELETE FROM settings WHERE key = ?').run('last_sync_error');

			this.logger.info(`Manual registry sync completed successfully in ${duration}ms`);
		} catch (error) {
			this.logger.error('Manual registry sync failed:', error);

			// Record the error
			try {
				db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('last_sync_error', error instanceof Error ? error.message : String(error));
			} catch (dbError) {
				// Ignore - just unable to save the error
			}
		} finally {
			this.isSyncing = false;
		}
	}
}
