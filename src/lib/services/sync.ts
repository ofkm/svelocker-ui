import cron from 'node-cron';
import { getRegistryReposAxios } from '$lib/utils/repos';
import { RegistryCache } from './db';
import { env } from '$env/dynamic/public';

export class RegistrySyncService {
	private static instance: RegistrySyncService;
	private cronJob: cron.ScheduledTask;

	private constructor() {
		// Run every 5 minutes by default
		this.cronJob = cron.schedule('*/5 * * * *', async () => {
			try {
				console.log('Starting registry sync...');
				const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
				await RegistryCache.syncFromRegistry(registryData.repositories);
				console.log('Registry sync completed successfully');
			} catch (error) {
				console.error('Registry sync failed:', error);
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
		console.log('Registry sync service started');
	}

	public stop(): void {
		this.cronJob.stop();
		console.log('Registry sync service stopped');
	}

	public async syncNow(): Promise<void> {
		try {
			console.log('Starting manual registry sync...');
			const registryData = await getRegistryReposAxios(env.PUBLIC_REGISTRY_URL + '/v2/_catalog');
			await RegistryCache.syncFromRegistry(registryData.repositories);
			console.log('Manual registry sync completed successfully');
		} catch (error) {
			console.error('Manual registry sync failed:', error);
			throw error;
		}
	}
}
