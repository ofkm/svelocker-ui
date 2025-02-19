import { RegistrySyncService } from '$lib/services/sync';

// Initialize sync service when server starts
RegistrySyncService.getInstance().start();

export async function handle({ event, resolve }) {
	return resolve(event);
}
