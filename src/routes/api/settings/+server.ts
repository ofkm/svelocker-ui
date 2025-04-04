import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setConfigValue } from '$lib/services/database/app-config';

// Save a setting
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { key, value } = await request.json();

		if (!key || typeof key !== 'string') {
			return json({ error: 'Invalid key' }, { status: 400 });
		}

		setConfigValue(key, value.toString());

		return json({ success: true });
	} catch (error) {
		console.error('Error saving setting:', error);
		return json({ error: 'Failed to save setting' }, { status: 500 });
	}
};
