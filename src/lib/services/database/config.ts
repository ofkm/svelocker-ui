import { db } from './connection';

export async function getAppConfig(key: string): Promise<string | null> {
	try {
		const result = db.prepare('SELECT value FROM app_config WHERE key = ?').get(key) as { value: string } | undefined;
		return result?.value || null;
	} catch (error) {
		console.error(`Failed to fetch config for key "${key}":`, error);
		return null;
	}
}

export async function getRegistryConfig() {
	const registryName = await getAppConfig('registry_name');
	const registryUrl = await getAppConfig('registry_url');
	return { registryName, registryUrl };
}
