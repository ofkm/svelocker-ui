import { defineConfig } from '@playwright/test';
import { setupTestEnvironment, teardownTestEnvironment } from './tests/e2e/setup';

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30000,
	expect: {
		timeout: 5000
	},
	fullyParallel: false,
	globalSetup: './tests/e2e/global-setup', // Run tests sequentially since we're using a shared registry
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' }
		}
	],

	webServer: {
		command: 'npm run build && PLAYWRIGHT=true DB_PATH=test.db npm run preview -- --host',
		port: 3000,
		reuseExistingServer: !process.env.CI,
		env: {
			PLAYWRIGHT: 'true',
			DB_PATH: 'test.db',
			PUBLIC_REGISTRY_URL: 'http://localhost:5001',
			PUBLIC_REGISTRY_NAME: 'Playwright Registry'
		},
		timeout: 120000, // Increase timeout to 2 minutes
		stdout: 'pipe', // Pipe server output for better debugging
		stderr: 'pipe'
	}
});
