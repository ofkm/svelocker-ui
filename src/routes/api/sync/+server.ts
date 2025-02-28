import { json } from '@sveltejs/kit';
import { incrementalSync, getSyncStatus } from '$lib/services/database';
import { Logger } from '$lib/services/logger';

const logger = Logger.getInstance('SyncAPI');

export async function GET({ url }) {
	try {
		// Return current sync status
		return json(getSyncStatus());
	} catch (error) {
		logger.error('Error getting sync status:', error);
		return json({ error: 'Failed to get sync status' }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		// Parse the request body only if it has content
		let forceFullSync = false;

		try {
			const contentType = request.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				const text = await request.text();
				if (text) {
					const body = JSON.parse(text);
					forceFullSync = body?.fullSync === true;
				}
			}
		} catch (parseError) {
			logger.warn('Failed to parse request body, using default settings:', parseError);
		}

		// Start sync time
		const startTime = Date.now();
		logger.info(`Starting manual sync (forceFullSync=${forceFullSync})...`);

		// Get sync service to handle synchronization
		const { RegistrySyncService } = await import('$lib/services/sync');
		await RegistrySyncService.getInstance().syncNow(forceFullSync);

		// Calculate duration
		const duration = Date.now() - startTime;

		return json({
			success: true,
			message: `Sync completed in ${duration}ms`,
			syncType: forceFullSync ? 'full' : 'delta',
			...getSyncStatus()
		});
	} catch (error) {
		logger.error('Error during manual sync:', error);

		// Record error
		try {
			const db = (await import('$lib/services/database/connection')).db;
			db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('last_sync_error', error instanceof Error ? error.message : String(error));
		} catch (dbError) {
			// Ignore - just unable to save the error
		}

		return json(
			{
				error: 'Sync failed',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
