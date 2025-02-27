import cron from 'node-cron';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { syncFromRegistry } from '$lib/services/database';
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
		this.logger.info('Starting registry sync...');

		try {
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
			await syncFromRegistry(registryData.repositories);

			// Update the last sync time in the database
			try {
				// Check if settings table exists
				const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get();

				if (!tableCheck) {
					// Create settings table if it doesn't exist
					db.prepare(
						`
						CREATE TABLE IF NOT EXISTS settings (
							key TEXT PRIMARY KEY,
							value INTEGER NOT NULL
						)
					`
					).run();
					this.logger.info('Created settings table');
				}

				const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
				stmt.run('last_sync_time', Date.now());
			} catch (error) {
				this.logger.error('Error updating last sync time:', error);
			}

			this.logger.info('Registry sync completed successfully');
		} catch (error) {
			this.logger.error('Registry sync failed', error);
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

	public async syncNow(): Promise<void> {
		if (!this.isSyncing) {
			await this.performSync();
		}
	}
}
