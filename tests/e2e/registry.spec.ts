import { test, expect } from '@playwright/test';

test.describe('Docker Registry UI (Mocked)', () => {
	// Basic display test
	test('should display mock registry data and tags', async ({ page }) => {
		await page.goto('/?mock=basic');
		await page.waitForLoadState('networkidle');

		// Check basic display
		await expect(page.getByText('namespace1')).toBeVisible();
		await expect(page.getByText('Found 1 Repository in test-registry')).toBeVisible();

		// Click the repository and wait longer for animations
		await page.getByText('namespace1').click();
		await page.waitForTimeout(1000);

		// Click the tag button using the data-testid from tag-dropdown-actions.svelte
		const tagButton = page.getByTestId('tag-button');
		await expect(tagButton).toBeVisible();
		await tagButton.click();
	});

	// Search test
	test('should filter repositories by search', async ({ page }) => {
		await page.goto('/?mock=search');
		await page.waitForLoadState('networkidle');

		await page.getByPlaceholder('Search repositories...').fill('name');

		await expect(page.getByText('namespace1')).toBeVisible();
		await expect(page.getByText('backend-api')).not.toBeVisible();
	});

	// Pagination test
	test('should handle pagination', async ({ page }) => {
		await page.goto('/?mock=pagination');
		await page.waitForLoadState('networkidle');

		// Check first page
		await expect(page.getByText('namespace1')).toBeVisible();
		await expect(page.getByText('namespace5')).toBeVisible();
		await expect(page.getByText('namespace6')).not.toBeVisible();

		// Go to next page
		await page.getByRole('button', { name: /next/i }).click();

		// Check second page
		await expect(page.getByText('namespace6')).toBeVisible();
		await expect(page.getByText('namespace10')).toBeVisible();
	});

	// Error state test
	test('should display error message', async ({ page }) => {
		try {
			await page.goto('/?mock=error');
			await page.waitForLoadState('networkidle');
		} catch (error) {
			console.error('Navigation error:', error);
			throw error; // Re-throw the error to fail the test
		}

		// Check for error message
		await expect(page.getByText(/Unable to connect to registry/)).toBeVisible();
	});

	// Empty state test
	test('should show empty state', async ({ page }) => {
		await page.goto('/?mock=empty');
		await page.waitForLoadState('networkidle');

		// Check for empty state message
		await expect(page.getByText('Could not pull registry data...')).toBeVisible();
	});
});
