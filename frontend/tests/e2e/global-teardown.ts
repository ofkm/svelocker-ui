import { teardownTestEnvironment } from './setup';

async function globalTeardown() {
	await teardownTestEnvironment();
}

export default globalTeardown;
