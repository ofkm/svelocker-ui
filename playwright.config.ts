import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
	testDir: './tests/e2e',
	outputDir: 'tests/',
	webServer: {
		command: 'npm run build && npm run preview',
		port: 3000,
		reuseExistingServer: !process.env.CI,
		env: {
			PUBLIC_REGISTRY_URL: 'http://localhost:5000',
			PUBLIC_REGISTRY_NAME: 'test-registry',
			PLAYWRIGHT: 'true'
		}
	},
	use: {
		baseURL: 'http://localhost:3000'
	},
	reporter: [
		['list'], // Use the 'list' reporter
		['html', { outputFolder: 'tests/.test-report' }] // Specify the HTML report output directory
	]
});
