import { browser } from '$app/environment';

// Storage key prefix
const STORAGE_PREFIX = 'svelocker_config_';

/**
 * Get a configuration value from localStorage
 * @param key The configuration key
 * @param defaultValue Default value if key doesn't exist
 * @returns The configuration value or default
 */
export function getConfigValue(key: string, defaultValue: string = ''): string {
	if (!browser) return defaultValue;

	try {
		const storedValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
		return storedValue !== null ? storedValue : defaultValue;
	} catch (error) {
		console.error(`Error getting client config for ${key}:`, error);
		return defaultValue;
	}
}

/**
 * Set a configuration value in localStorage
 * @param key The configuration key
 * @param value The configuration value
 */
export function setConfigValue(key: string, value: string): void {
	if (!browser) return;

	try {
		localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
	} catch (error) {
		console.error(`Error setting client config for ${key}:`, error);
	}
}

/**
 * Delete a configuration value
 * @param key The configuration key
 */
export function deleteConfigValue(key: string): void {
	if (!browser) return;

	try {
		localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
	} catch (error) {
		console.error(`Error deleting client config for ${key}:`, error);
	}
}

/**
 * Reset all configuration values
 */
export function resetAllConfig(): void {
	if (!browser) return;

	try {
		// Only remove items with our prefix
		Object.keys(localStorage)
			.filter((key) => key.startsWith(STORAGE_PREFIX))
			.forEach((key) => localStorage.removeItem(key));
	} catch (error) {
		console.error('Error resetting all client config:', error);
	}
}

/**
 * Sync a specific config from server to client
 * @param key Config key
 * @param value Config value from server
 */
export function syncConfigFromServer(key: string, value: string): void {
	setConfigValue(key, value);
}

/**
 * Sync all config from server to client
 * @param serverConfig Object with all server config
 */
export function syncAllConfigFromServer(serverConfig: Record<string, string>): void {
	if (!browser) return;

	try {
		Object.entries(serverConfig).forEach(([key, value]) => {
			setConfigValue(key, value);
		});
	} catch (error) {
		console.error('Error syncing config from server:', error);
	}
}
