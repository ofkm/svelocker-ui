import cron from 'node-cron';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { RegistryCache } from './db';
import { env } from '$env/dynamic/public';

export class RegistrySyncService {
	private static instance: RegistrySyncService;
	private cronJob: cron.ScheduledTask;

	private logWithTimestamp(message: string): void {
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}] ${message}`);
	}

	private logErrorWithTimestamp(message: string, error: any): void {
		const timestamp = new Date().toISOString();
		console.error(`[${timestamp}] ${message}`, error);
	}

	private constructor() {
		// Run every 5 minutes by default
		this.cronJob = cron.schedule('*/5 * * * *', async () => {
			try {
				this.logWithTimestamp('Starting registry sync...');
				const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
				await RegistryCache.syncFromRegistry(registryData.repositories);
				this.logWithTimestamp('Registry sync completed successfully');
			} catch (error) {
				this.logErrorWithTimestamp('Registry sync failed:', error);
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
		this.logWithTimestamp('Registry sync service started');
	}

	public stop(): void {
		this.cronJob.stop();
		this.logWithTimestamp('Registry sync service stopped');
	}

	public async syncNow(): Promise<void> {
		try {
			this.logWithTimestamp('Starting manual registry sync...');
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
			await RegistryCache.syncFromRegistry(registryData.repositories);
			this.logWithTimestamp('Manual registry sync completed successfully');
		} catch (error) {
			this.logErrorWithTimestamp('Manual registry sync failed:', error);
			throw error;
		}
	}
}
