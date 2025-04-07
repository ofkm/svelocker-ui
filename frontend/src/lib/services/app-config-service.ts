import type { AppConfigItem } from '$lib/types';

export class AppConfigService {
	private static instance: AppConfigService;
	private configCache: Map<string, string> = new Map();
	private baseUrl = 'http://localhost:8080';

	private constructor() {}

	public static getInstance(): AppConfigService {
		if (!AppConfigService.instance) {
			AppConfigService.instance = new AppConfigService();
		}
		return AppConfigService.instance;
	}

	async loadAllConfigs(): Promise<Map<string, string>> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/config`);
			if (!response.ok) {
				throw new Error('Failed to load configurations');
			}
			const configs: AppConfigItem[] = await response.json();
			this.configCache.clear();
			configs.forEach((config) => this.configCache.set(config.key, config.value));
			return this.configCache;
		} catch (error) {
			console.error('Error loading configs:', error);
			throw error;
		}
	}

	async getConfig(key: string): Promise<string | null> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/config/${key}`);
			if (response.status === 404) {
				return null;
			}
			if (!response.ok) {
				throw new Error('Failed to get configuration');
			}
			const config: AppConfigItem = await response.json();
			this.configCache.set(config.key, config.value);
			return config.value;
		} catch (error) {
			console.error(`Error getting config for key ${key}:`, error);
			throw error;
		}
	}

	async updateConfig(key: string, value: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/config/${key}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ value })
			});
			if (!response.ok) {
				throw new Error('Failed to update configuration');
			}
			this.configCache.set(key, value);
		} catch (error) {
			console.error(`Error updating config for key ${key}:`, error);
			throw error;
		}
	}

	getCachedConfig(key: string): string | undefined {
		return this.configCache.get(key);
	}
}

// Example Usage
// const configService = AppConfigService.getInstance();
// await configService.loadAllConfigs(); // Load all configs at app startup

// Later, get a specific config
// const value = await configService.getConfig('some-key');
