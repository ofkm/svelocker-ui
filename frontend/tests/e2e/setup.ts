import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

// Path to test DB
const TEST_DB_PATH = './tests/e2e/test.db';

/**
 * Sets up the test environment
 */
export async function setupTestEnvironment() {
	console.log('Setting up test environment');
	console.log('PLAYWRIGHT env variable is:', process.env.PLAYWRIGHT);

	// Set it explicitly in case it wasn't set
	process.env.PLAYWRIGHT = 'true';

	console.log('🚀 Setting up test environment...');

	try {
		// Start Docker services
		await execPromise('docker compose -f tests/e2e/docker-compose.test.yml up -d');
		console.log('✅ Started Docker registry container');

		// Wait for services to be ready
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Push test images to registry
		await pushTestImages();
		console.log('✅ Pushed test images to registry');

		// Set environment variables for tests
		process.env.DB_PATH = TEST_DB_PATH;
		process.env.PUBLIC_REGISTRY_URL = 'http://localhost:5001';
		process.env.PUBLIC_API_URL = 'http://localhost:3000';

		console.log('✅ Test environment setup complete');
	} catch (error) {
		console.error('❌ Error setting up test environment:', error);
		throw error;
	}
}

/**
 * Push test images to the registry
 */
async function pushTestImages() {
	const images = [
		{ name: 'caddy', tag: 'alpine' },
		{ name: 'redis', tag: 'alpine' },
		{ name: 'nginx', tag: '1.27.4-alpine' }
	];

	for (const image of images) {
		// Create test namespace
		console.log('Creating test namespace');
		const testNamespace = 'test';
		// Pull image
		await execPromise(`docker pull ${image.name}:${image.tag}`);
		// Tag for local registry with test namespace
		console.log(`Tagging ${image.name}:${image.tag} as ${testNamespace}/${image.name}`);
		await execPromise(`docker tag ${image.name}:${image.tag} localhost:5001/${testNamespace}/${image.name}:${image.tag}`);

		// Push to local registry
		console.log(`Pushing to registry: localhost:5001/${testNamespace}/${image.name}:${image.tag}`);
		await execPromise(`docker push localhost:5001/${testNamespace}/${image.name}:${image.tag}`);

		// Add another tag variant
		console.log(`Tagging ${image.name}:${image.tag} as ${testNamespace}/${image.name}:beta`);
		await execPromise(`docker tag ${image.name}:${image.tag} localhost:5001/${testNamespace}/${image.name}:beta`);
		await execPromise(`docker push localhost:5001/${testNamespace}/${image.name}:beta`);
	}

	console.log('Pushed test images to registry');
}

/**
 * Tears down the test environment
 */
export async function teardownTestEnvironment() {
	console.log('Tearing down test environment');
	console.log('🧹 Cleaning up test environment...');

	try {
		// Stop Docker services
		await execPromise('docker compose -f tests/e2e/docker-compose.test.yml down -v');
		console.log('✅ Stopped Docker containers and removed volumes');

		// Remove test database
		if (fs.existsSync(TEST_DB_PATH)) {
			fs.unlinkSync(TEST_DB_PATH);
		}

		console.log('✅ Test environment cleanup complete');
	} catch (error) {
		console.error('❌ Error cleaning up test environment:', error);
	}
}
