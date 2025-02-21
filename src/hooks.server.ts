import { RegistrySyncService } from '$lib/services/sync';
import { Logger } from '$lib/services/logger';
import type { Handle } from '@sveltejs/kit';

const logger = Logger.getInstance('ServerHooks');

// Initialize sync service when server starts
const syncService = RegistrySyncService.getInstance();
syncService.start();

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
