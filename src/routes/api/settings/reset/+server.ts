import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resetAllConfig } from '$lib/services/database/app-config';

// Reset all settings
export const POST: RequestHandler = async () => {
	try {
		resetAllConfig();
		return json({ success: true });
	} catch (error) {
		console.error('Error resetting settings:', error);
		return json({ error: 'Failed to reset settings' }, { status: 500 });
	}
};
