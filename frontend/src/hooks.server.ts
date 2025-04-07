import { RegistrySyncService } from '$lib/services/sync';
import { Logger } from '$lib/services/logger';
import type { Handle } from '@sveltejs/kit';
import { initDatabase } from '$lib/services/database';
import { runMigrations } from '$lib/services/database/migrations';

const logger = Logger.getInstance('ServerHooks');

// Initialize database and sync service when server starts
async function initialize() {}

// Run initialization
initialize();

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
