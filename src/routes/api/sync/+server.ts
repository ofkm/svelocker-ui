import { json } from '@sveltejs/kit';
import { RegistrySyncService } from '$lib/services/sync';
import { Logger } from '$lib/services/logger';

let isSyncing = false;
const logger = Logger.getInstance('SyncEndpoint');

export async function POST() {
	if (isSyncing) {
		logger.warn('Sync already in progress, skipping request');
		return json(
			{
				success: false,
				error: 'Sync already in progress'
			},
			{ status: 429 }
		);
	}

	try {
		isSyncing = true;
		logger.info('Starting manual sync...');
		await RegistrySyncService.getInstance().syncNow();
		logger.info('Manual sync completed');
		return json({ success: true });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`Sync failed: ${errorMessage}`);
		return json(
			{
				success: false,
				error: errorMessage
			},
			{ status: 500 }
		);
	} finally {
		isSyncing = false;
	}
}
