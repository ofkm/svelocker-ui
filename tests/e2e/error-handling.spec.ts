import { test, expect } from '@playwright/test';

test.describe('Error Handling Scenarios', () => {
	test('should handle invalid repository gracefully', async ({ page }) => {
		// Navigate to a non-existent repository
		await page.goto('/details/non-existent-repo/image/tag');

		// Wait for the page to load
		await page.waitForLoadState('networkidle', { timeout: 10000 });

		// Check for error message
		await expect(page.getByText(/not found|doesn't exist|no repository/i)).toBeVisible();
	});

	test('should recover from bad search input', async ({ page }) => {
		await page.goto('/');

		// Wait for the page to load
		await page.waitForLoadState('networkidle', { timeout: 15000 });

		// Enter a search that won't match anything
		await page.getByTestId('dashboard-searchbar').fill('zzzzzzzzzzzzzzzzzzzzz');
		await page.keyboard.press('Enter');

		// Wait for search results
		await page.waitForTimeout(1000);

		// Should show "No repositories found" message
		await expect(page.getByText(/No matches found for/i)).toBeVisible();

		// Clear search and verify repositories come back
		await page.getByTestId('dashboard-searchbar').fill('');
		await page.keyboard.press('Enter');

		// Wait for results
		await page.waitForTimeout(1000);

		// Check that repositories are displayed
		const repositories = await page.locator('[data-testid^="repository-card-"]').count();
		expect(repositories).toBeGreaterThan(0);
	});
});
