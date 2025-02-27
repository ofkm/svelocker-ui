import { setupTestEnvironment } from './setup';
import { type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
	await setupTestEnvironment();
}

export default globalSetup;
