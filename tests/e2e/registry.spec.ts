import { test, expect } from '@playwright/test';

test.describe('Registry UI with Real Registry', () => {
	test('should load the home page and show repositories', async ({ page }) => {
		// Go to the home page
		await page.goto('/');

		await page.getByRole('button', { name: 'Sync Registry' }).click();

		await page.waitForTimeout(500);

		await page.reload();

		// Wait for loading spinner to disappear and repositories to load
		await page.waitForSelector('.animate-spin', { state: 'attached' });
		await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });

		// Check that repositories are displayed - look for repository cards instead of the list
		const repositories = await page.locator('.repo-card').count();
		expect(repositories).toBeGreaterThan(0);

		// Verify test namespace is present
		await expect(page.getByText('test')).toBeVisible();
	});

	test('should filter repositories by search term', async ({ page }) => {
		await page.goto('/');

		// Wait for loading spinner to disappear
		await page.waitForSelector('.animate-spin', { state: 'attached' });
		await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });

		// Type 'nginx' in the search box
		await page.getByPlaceholder('Search repositories...').fill('nginx');
		await page.keyboard.press('Enter');

		// Wait for search results
		await page.waitForTimeout(500);

		// Verify nginx is visible
		await expect(page.getByText('nginx', { exact: false })).toBeVisible();
	});

	test('should show image tags when repository card is loaded', async ({ page }) => {
		await page.goto('/');

		// Wait for loading spinner to disappear
		await page.waitForSelector('.animate-spin', { state: 'attached' });
		await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });

		// Find the test repository card
		const testRepoCard = page.locator('.repo-card', { hasText: 'test' });
		await expect(testRepoCard).toBeVisible();

		// Check that nginx image name is visible in the card
		await expect(page.getByText('nginx', { exact: true })).toBeVisible();

		// Check that tag pills are visible directly
		await expect(page.getByText('1.27.4-alpine')).toBeVisible();
		await expect(page.getByText('beta')).toBeVisible();
	});

	test('should navigate to tag details page', async ({ page }) => {
		await page.goto('/');

		// Wait for loading spinner to disappear
		await page.waitForSelector('.animate-spin', { state: 'attached' });
		await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });

		// Find the 1.27.4-alpine tag link and click it directly
		// Use a more precise selector that combines the tag name with the link role
		await page.getByRole('link', { name: '1.27.4-alpine' }).first().click();

		// Check we're on the tag details page
		await expect(page).toHaveURL(/.*\/test\/nginx\/1.27.4-alpine/);

		// Verify tag details are shown
		await expect(page.getByTestId('image-details-header')).toBeVisible();
	});
});
