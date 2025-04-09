import type { PageServerLoad, Actions } from './$types';
import { AppConfigService } from '$lib/services/app-config-service';
import { env } from '$env/dynamic/public';
import { json, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const configService = AppConfigService.getInstance();
	const syncInterval = await configService.getSyncInterval();

	return {
		syncInterval
	};
};

export const actions: Actions = {
	async updateSyncInterval({ request }) {
		const formData = await request.formData(); // Use formData to read the body
		const syncInterval = formData.get('value'); // Get the value from form data

		// Validate syncInterval if necessary
		const validIntervals = [5, 15, 30, 60];
		if (!validIntervals.includes(Number(syncInterval))) {
			return fail(400, { message: 'Invalid sync interval. Must be 5, 15, 30, or 60.' });
		}

		try {
			const response = await fetch(`${env.PUBLIC_BACKEND_URL}/api/v1/config/sync_interval`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ value: syncInterval })
			});

			if (!response.ok) {
				throw new Error('Failed to update sync interval');
			}

			return { success: true, message: 'Sync interval updated successfully' }; // Return a plain object
		} catch (error) {
			console.error('Error updating sync interval:', error);
			return fail(500, { message: 'Failed to update sync interval' }); // Use fail for errors
		}
	}
};
