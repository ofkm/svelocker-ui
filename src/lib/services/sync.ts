import cron from 'node-cron';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { RegistryCache } from './db';
import { env } from '$env/dynamic/public';
import { Logger } from '$lib/services/logger';

export class RegistrySyncService {
	private static instance: RegistrySyncService;
	private cronJob: cron.ScheduledTask;
	private logger: Logger;

	private constructor() {
		this.logger = Logger.getInstance('RegistrySync');

		// Run every 5 minutes by default
		this.cronJob = cron.schedule('*/5 * * * *', async () => {
			try {
				this.logger.info('Starting registry sync...');
				const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
				await RegistryCache.syncFromRegistry(registryData.repositories);
				this.logger.info('Registry sync completed successfully');
			} catch (error) {
				this.logger.error('Registry sync failed', error);
			}
		});
	}

	public static getInstance(): RegistrySyncService {
		if (!RegistrySyncService.instance) {
			RegistrySyncService.instance = new RegistrySyncService();
		}
		return RegistrySyncService.instance;
	}

	public start(): void {
		this.cronJob.start();
		this.logger.info('Registry sync service started');
	}

	public stop(): void {
		this.cronJob.stop();
		this.logger.info('Registry sync service stopped');
	}

	public async syncNow(): Promise<void> {
		try {
			this.logger.info('Starting manual registry sync...');
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
			await RegistryCache.syncFromRegistry(registryData.repositories);
			this.logger.info('Manual registry sync completed successfully');
		} catch (error) {
			this.logger.error('Manual registry sync failed', error);
			throw error;
		}
	}
}
