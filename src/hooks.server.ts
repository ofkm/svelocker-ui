import { RegistrySyncService } from '$lib/services/sync';
import { Logger } from '$lib/services/logger';
import type { Handle } from '@sveltejs/kit';
import { initDatabase } from '$lib/services/database';
import { runMigrations } from '$lib/services/database/migrations';

const logger = Logger.getInstance('ServerHooks');

// Initialize database and sync service when server starts
async function initialize() {
	try {
		logger.info('Initializing database...');
		await initDatabase();

		// Run migrations explicitly to ensure schema is up to date
		await runMigrations();
		logger.info('Database initialization complete');

		// Initialize sync service
		const syncService = RegistrySyncService.getInstance();
		syncService.start();
	} catch (error) {
		logger.error('Failed to initialize application:', error);
	}
}

// Run initialization
initialize();

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
