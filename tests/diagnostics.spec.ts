import { test, expect } from '@playwright/test';

test.describe('Successor Recipe App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser Page Error] ${err.message}\n${err.stack}`));
    
    // Navigate to local server
    await page.goto('http://localhost:8000');
  });

  test('should load app and bypass auth gateway after spinner timeout', async ({ page }) => {
    // Wait for the login/auth gateway to be visible (disappearing spinner)
    const authCard = page.locator('.auth-card');
    await expect(authCard).toBeVisible({ timeout: 10000 });

    // Click offline fallback mode
    const offlineBtn = page.getByRole('button', { name: 'Run in Offline Fallback Mode' });
    await offlineBtn.click();

    // Main app container should load
    const appContainer = page.locator('.app-container');
    await expect(appContainer).toBeVisible();

    // The welcome header should have the correct branding
    const headerTitle = page.locator('.welcome-text h1');
    await expect(headerTitle).toHaveText('Successor Recipe App');
  });

  test('should verify recipe category filtering', async ({ page }) => {
    const offlineBtn = page.getByRole('button', { name: 'Run in Offline Fallback Mode' });
    await expect(offlineBtn).toBeVisible({ timeout: 10000 });
    await offlineBtn.click();

    // Navigate to Recipe Hub tab
    await page.getByRole('button', { name: 'Recipe Hub' }).click();

    // Recipe Hub section should be active
    const recipeTab = page.locator('#recipes');
    await expect(recipeTab).toHaveClass(/active/);

    // Initial count of default recipes should be visible (e.g. 7 recipes)
    const recipeCards = page.locator('.recipe-card');
    const initialCount = await recipeCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Filter by "treat" category
    await page.locator('#recipe-category').selectOption('treat');

    // Should only show 1 recipe card (Dark Cocoa Bark)
    await expect(recipeCards).toHaveCount(1);
    const barkTitle = page.locator('.recipe-card h3');
    await expect(barkTitle).toHaveText('Adelaide Dark Cocoa Bark');
  });
});
