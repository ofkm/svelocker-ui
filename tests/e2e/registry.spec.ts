import { test, expect } from '@playwright/test';

test.describe('Docker Registry UI', () => {
	// Setup for all tests
	test.beforeEach(async ({ page }) => {
		// Add any common setup actions here
	});

	test.describe('Repository Listing', () => {
		test('should display repositories correctly', async ({ page }) => {
			await page.goto('/?mock=basic');
			await page.waitForLoadState('networkidle');

			await expect(page.getByText('namespace1')).toBeVisible();
			await expect(page.getByText('Found 1 Repository in test-registry')).toBeVisible();

			// Check for repository cards
			await expect(page.getByTestId('repo-card')).toBeVisible();
		});

		test('should show registry health status', async ({ page }) => {
			await page.goto('/?mock=basic');
			await page.waitForLoadState('networkidle');

			// Check health indicator is visible
			await expect(page.getByText('Registry Healthy')).toBeVisible();
			await expect(page.locator('.bg-green-500')).toBeVisible();
		});

		test('should show unhealthy registry status', async ({ page }) => {
			await page.goto('/?mock=unhealthy');
			await page.waitForLoadState('networkidle');

			// Check for unhealthy indicator
			await expect(page.getByText('Could not pull registry data...')).toBeVisible();
		});
	});

	test.describe('Repository Search', () => {
		test('should filter repositories by name', async ({ page }) => {
			await page.goto('/?mock=search');
			await page.waitForLoadState('networkidle');

			await page.getByPlaceholder('Search repositories...').fill('name');

			await expect(page.getByText('namespace1')).toBeVisible();
			await expect(page.getByText('backend-api')).not.toBeVisible();
		});

		test('should filter repositories by image name', async ({ page }) => {
			await page.goto('/?mock=search');
			await page.waitForLoadState('networkidle');

			// Search for an image name
			await page.getByPlaceholder('Search repositories...').fill('frontend');

			// First, verify that the repository containing the image is visible
			await expect(page.getByText('namespace1')).toBeVisible();

			// Expand the repository card to see its images
			await page.getByText('namespace1').click();
			await page.waitForTimeout(500); // Wait for animation

			// Now check for the image name after expanding
			await expect(page.getByRole('row', { name: /frontend-app/ })).toBeVisible();

			// Verify that other content is not visible
			await expect(page.getByText('backend-api')).not.toBeVisible();
		});

		test('should show "no results" message when search has no matches', async ({ page }) => {
			await page.goto('/?mock=search');
			await page.waitForLoadState('networkidle');

			await page.getByPlaceholder('Search repositories...').fill('nonexistent');

			await expect(page.getByText('No matches found matching')).toBeVisible();
		});
	});

	test.describe('Pagination', () => {
		test('should navigate between pages', async ({ page }) => {
			await page.goto('/?mock=pagination');
			await page.waitForLoadState('networkidle');

			// First page content
			await expect(page.getByText('namespace1')).toBeVisible();
			await expect(page.getByText('namespace6')).not.toBeVisible();

			// Go to next page
			await page.getByRole('button', { name: /next/i }).click();
			await page.waitForTimeout(300); // Small wait for any animations

			// Second page content
			await expect(page.getByText('namespace6')).toBeVisible();
			await expect(page.getByText('namespace2')).not.toBeVisible();
		});
	});

	test.describe('Repository Expansion', () => {
		test('should expand repository to show images', async ({ page }) => {
			await page.goto('/?mock=basic');
			await page.waitForLoadState('networkidle');

			// Initial state - check image rows aren't visible
			await expect(page.getByRole('row', { name: /frontend-app/ })).not.toBeVisible();

			// Expand repository
			await page.getByText('namespace1').click();
			await page.waitForTimeout(500); // Wait for animation

			// Check that image rows are now visible
			await expect(page.getByRole('row', { name: /frontend-app/ })).toBeVisible();
			await expect(page.getByRole('row', { name: /backend-api/ })).toBeVisible();
		});
	});

	test.describe('Tag Actions', () => {
		test('should display tag dropdown when clicked', async ({ page }) => {
			await page.goto('/?mock=basic');
			await page.waitForLoadState('networkidle');

			// Expand repository
			await page.getByText('namespace1').click();
			await page.waitForTimeout(500);

			// Click tag button
			const tagButton = page.getByTestId('tag-button-frontend-app');
			await expect(tagButton).toBeVisible();
			await tagButton.click();

			// Check dropdown content
			await expect(page.getByTestId('dropdown-content-frontend-app')).toBeVisible();
		});
	});

	test.describe('Error States', () => {
		test('should display error message when registry connection fails', async ({ page }) => {
			await page.goto('/?mock=error');
			await page.waitForLoadState('networkidle');

			// Check for error message
			await expect(page.getByText(/Unable to connect to registry/)).toBeVisible();
		});

		test('should show empty state when no repositories exist', async ({ page }) => {
			await page.goto('/?mock=empty');
			await page.waitForLoadState('networkidle');

			// Check for empty state message
			await expect(page.getByText('Could not pull registry data...')).toBeVisible();
		});

		test('should show error when registry is unhealthy', async ({ page }) => {
			await page.goto('/?mock=unhealthy');
			await page.waitForLoadState('networkidle');

			// Instead of looking for "Registry Unhealthy" text that doesn't exist,
			// look for the actual error message shown when registry is unavailable
			await expect(page.getByText(/Could not pull registry data.../)).toBeVisible();
		});
	});

	// Add test for tag details page
	test.describe('Tag Details Page', () => {
		test('should display metadata correctly', async ({ page }) => {
			// Use the tag details mock
			await page.goto('/details/namespace1/frontend-app/latest?mock=tagDetails');
			await page.waitForLoadState('networkidle');

			// Check various metadata fields are displayed
			await expect(page.getByText('linux')).toBeVisible(); // OS
			await expect(page.getByText('amd64')).toBeVisible(); // Architecture
			await expect(page.getByText('Developer Name')).toBeVisible(); // Author

			// Check Dockerfile is displayed
			await expect(page.getByText('FROM node:18')).toBeVisible();
		});
	});
});
