import type { PageServerLoad, Actions } from './$types';
import { getAllConfig, setConfigValue, resetAllConfig } from '$lib/services/database/app-config';

export const load: PageServerLoad = async () => {
	// Get all settings
	const config = getAllConfig();

	// Convert to a more client-friendly format
	const settings = config.reduce(
		(acc: Record<string, string>, item: { key: string; value: string }) => {
			acc[item.key] = item.value;
			return acc;
		},
		{} as Record<string, string>
	);

	return {
		settings
	};
};

// Handle form actions for settings updates
export const actions: Actions = {
	updateSetting: async ({ request }) => {
		const formData = await request.formData();
		const key = formData.get('key')?.toString();
		const value = formData.get('value')?.toString();

		if (key && value) {
			setConfigValue(key, value);
			return { success: true, key, value };
		}

		return { success: false, error: 'Invalid key or value' };
	},

	resetSettings: async () => {
		resetAllConfig();
		return { success: true };
	}
};
