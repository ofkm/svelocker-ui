import { test, expect } from '@playwright/test';

test.describe('Registry UI with Real Registry', () => {
	test('should load the home page and show repositories', async ({ page }) => {
		// Go to the home page
		await page.goto('/');

		await page.getByText('Sync').click();

		await page.waitForTimeout(500);

		await page.reload();

		// Wait for data to load
		await page.waitForSelector('[data-testid="repository-list"]', { timeout: 10000 });

		// Check that repositories are displayed
		const repositories = await page.locator('[data-testid="repository-row"]').count();
		expect(repositories).toBeGreaterThan(0);

		// Verify test namespace is present
		await expect(page.getByText('test')).toBeVisible();
	});

	test('should filter repositories by search term', async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('[data-testid="repository-list"]');

		// Type 'nginx' in the search box
		await page.getByPlaceholder('Search repositories...').fill('nginx');
		await page.keyboard.press('Enter');

		// Wait for search results
		await page.waitForTimeout(500);

		// Verify nginx is visible but alpine is not
		await expect(page.getByText('nginx', { exact: false })).toBeVisible();
		await expect(page.getByText('alpine', { exact: false })).not.toBeVisible();
	});

	test('should show tag dropdown when clicked', async ({ page }) => {
		await page.goto('/');

		// Wait for repositories to load
		await page.waitForSelector('[data-testid="repository-list"]');

		// Expand the test namespace
		await page.getByText('test').click();

		// Wait for images to appear
		await page.waitForSelector('[data-testid="image-row-test-nginx"]');

		// Find and click the tag button for nginx
		await page.locator('[data-testid="tag-dropdown-test-nginx"]').click();

		// Verify the dropdown is visible
		await expect(page.locator('[data-testid="dropdown-content-test-nginx"]')).toBeVisible();

		// Verify tags are shown in the dropdown
		await expect(page.getByText('1.27.4-alpine')).toBeVisible();
		await expect(page.getByText('beta')).toBeVisible();
	});

	test('should navigate to tag details page', async ({ page }) => {
		await page.goto('/');

		// Wait for data to load
		await page.waitForSelector('[data-testid="repository-list"]');

		// Expand the test namespace
		await page.getByText('test').click();

		// Click on tag dropdown
		await page.locator('[data-testid="tag-dropdown-test-nginx"]').click();

		// Click on a specific tag in dropdown
		await page.getByText('1.27.4-alpine', { exact: true }).click();

		// Check we're on the tag details page
		await expect(page).toHaveURL(/.*\/test\/nginx\/1.27.4-alpine/);

		// Verify tag details are shown
		await expect(page.getByTestId('image-details-header')).toBeVisible();
		// await expect(page.getByText('test/nginx:1.27.4-alpine')).toBeVisible();
	});
});
