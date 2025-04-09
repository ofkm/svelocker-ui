import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	outputDir: './tests/.output',
	testDir: './tests/e2e',
	timeout: 30000,
	expect: {
		timeout: 5000
	},
	fullyParallel: false,
	globalSetup: './tests/e2e/global-setup',
	globalTeardown: './tests/e2e/global-teardown',
	reporter: process.env.CI ? [['html', { outputFolder: 'tests/.output/.report' }], ['github']] : [['line'], ['html', { open: 'never', outputFolder: 'tests/.report' }]],
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' }
		}
	]
});
