import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

// Path to test DB
const TEST_DB_PATH = 'test.db';

/**
 * Sets up the test environment
 */
export async function setupTestEnvironment() {
	console.log('Setting up test environment');
	console.log('PLAYWRIGHT env variable is:', process.env.PLAYWRIGHT);

	// Set it explicitly in case it wasn't set
	process.env.PLAYWRIGHT = 'true';

	console.log('🚀 Setting up test environment...');

	// Remove any existing test DB
	if (fs.existsSync(TEST_DB_PATH)) {
		fs.unlinkSync(TEST_DB_PATH);
		console.log('✅ Removed old test database');
	}

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
		process.env.PUBLIC_API_URL = 'http://localhost:5173';

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
		{ name: 'alpine', tag: '3.14' },
		{ name: 'busybox', tag: 'latest' },
		{ name: 'nginx', tag: '1.21' }
	];

	for (const image of images) {
		// Pull image
		await execPromise(`docker pull ${image.name}:${image.tag}`);

		// Tag for local registry
		await execPromise(`docker tag ${image.name}:${image.tag} localhost:5001/test/${image.name}:${image.tag}`);

		// Push to local registry
		await execPromise(`docker push localhost:5001/test/${image.name}:${image.tag}`);

		// Add another tag variant for testing
		if (image.name === 'nginx') {
			await execPromise(`docker tag ${image.name}:${image.tag} localhost:5001/test/${image.name}:beta`);
			await execPromise(`docker push localhost:5001/test/${image.name}:beta`);
		}
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
