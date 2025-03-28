import { test, expect } from '@playwright/test';

test.describe('Registry UI with Real Registry', () => {
	test('should load the home page and show repositories', async ({ page }) => {
		// Go to the home page
		await page.goto('/');

		// Click the sync button and wait for it to complete
		await page.getByRole('button', { name: 'Sync Registry' }).click();

		// Wait a moment for the sync operation to start
		await page.waitForTimeout(1000);

		// Reload the page to see updated content
		await page.reload();

		// Simply wait until repositories appear or the timeout hits
		try {
			// Wait for repo cards to appear (up to 15 seconds)
			await page.locator('[data-testid^="repository-card-"]').first().waitFor({ timeout: 15000 });
		} catch (e) {
			// If timeout, take a screenshot for debugging
			await page.screenshot({ path: 'test-results/timeout-repos.png' });
			throw e;
		}

		// Check that repositories are displayed
		const repositories = await page.locator('[data-testid^="repository-card-"]').count();
		expect(repositories).toBeGreaterThan(0);

		// Verify test namespace is present
		await expect(page.getByText('test')).toBeVisible();
	});

	test('should filter repositories by search term', async ({ page }) => {
		await page.goto('/');

		// Wait for the initial page load to complete
		await page.waitForLoadState('networkidle', { timeout: 15000 });

		// Wait for repo cards to appear
		await page.waitForSelector('[data-testid^="repository-card-"]', { timeout: 15000 });

		// Type 'nginx' in the search box
		await page.getByPlaceholder('Search repositories...').fill('nginx');
		await page.keyboard.press('Enter');

		// Wait for search results
		await page.waitForTimeout(1000);

		// Verify nginx is visible
		await expect(page.getByText('nginx', { exact: false })).toBeVisible();
	});

	test('should show image tags when repository card is loaded', async ({ page }) => {
		await page.goto('/');

		// Wait for the initial page load to complete
		await page.waitForLoadState('networkidle', { timeout: 15000 });

		// Wait for repo cards to appear
		await page.waitForSelector('[data-testid^="repository-card-"]', { timeout: 15000 });

		// Find the test repository card
		const testRepoCard = page.locator('[data-testid="repository-card-test"]');
		await expect(testRepoCard).toBeVisible();

		// Check that nginx image name is visible in the card
		await expect(page.getByText('nginx', { exact: true })).toBeVisible();

		// Check that tag pills are visible directly within the test repo card
		await expect(page.locator('[data-testid="tag-pill-test-nginx-1.27.4-alpine"]')).toBeVisible();
		await expect(page.locator('[data-testid="tag-pill-test-nginx-beta"]')).toBeVisible();
	});

	test('should navigate to tag details page', async ({ page }) => {
		await page.goto('/');

		// Wait for the initial page load to complete
		await page.waitForLoadState('networkidle', { timeout: 15000 });

		// Wait for repo cards to appear
		await page.waitForSelector('[data-testid^="repository-card-"]', { timeout: 15000 });

		// Find and click the 1.27.4-alpine tag link directly using the data-testid we added
		await page.locator('[data-testid="tag-pill-test-nginx-1.27.4-alpine"]').click();

		// Check we're on the tag details page
		await expect(page).toHaveURL(/.*\/details\/test\/nginx\/1.27.4-alpine/);

		// Verify tag details are shown
		await expect(page.getByTestId('image-details-header')).toBeVisible();
	});
});
