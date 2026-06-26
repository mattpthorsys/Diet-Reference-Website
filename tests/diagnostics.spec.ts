import { test, expect } from '@playwright/test';

test.describe('Successor Recipe App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser Page Error] ${err.message}\n${err.stack}`));
    
    // Automatically accept alert dialogs so they don't block E2E runs
    page.on('dialog', dialog => dialog.accept());

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

    // Should show 2 recipe cards (Dark Cocoa Bark & Bread and Butter Pudding)
    await expect(recipeCards).toHaveCount(2);
    const barkTitle = page.locator('.recipe-card h3').first();
    await expect(barkTitle).toHaveText('Adelaide Dark Cocoa Bark');
  });

  test('should verify recipe like and pin functionality and shopping list sorting', async ({ page }) => {
    const offlineBtn = page.getByRole('button', { name: 'Run in Offline Fallback Mode' });
    await expect(offlineBtn).toBeVisible({ timeout: 10000 });
    await offlineBtn.click();

    // Navigate to Recipe Hub tab
    await page.getByRole('button', { name: 'Recipe Hub' }).click();

    // Pin the Cocoa Bark card to bring it to the top
    const barkCard = page.locator('#recipe-bark');
    const pinBtn = barkCard.locator('.pin-btn');
    await pinBtn.click();

    // The bark card should now have the 'pinned' class
    await expect(barkCard).toHaveClass(/pinned/);

    // Verify it is now the first recipe card in the list
    const firstRecipeCardTitle = page.locator('.recipe-card h3').first();
    await expect(firstRecipeCardTitle).toHaveText('Adelaide Dark Cocoa Bark');

    // Click the Like button on the bark card
    const likeBtn = barkCard.locator('.like-btn');
    await likeBtn.click();

    // Toggle the Show Liked Only filter
    await page.locator('.favorites-group .toggle-liked').click();

    // Only 1 recipe card (Dark Cocoa Bark) should be visible
    const recipeCards = page.locator('.recipe-card');
    await expect(recipeCards).toHaveCount(1);

    // Reset Liked filter
    await page.locator('.favorites-group .toggle-liked').click();

    // Add Pinned recipe ingredients to shopping list
    const addToShoppingBtn = barkCard.locator('button:has-text("Add to Shopping List")');
    await addToShoppingBtn.click();

    // Navigate to Shopping List tab
    await page.getByRole('button', { name: 'Shopping List', exact: true }).click();

    // Verify pinned ingredients (from Dark Cocoa Bark) appear at the top of the bulk section
    // Cocoa Bark contains pepitas/pumpkin seeds in bulk, verify it is at the top of the list
    const firstBulkItem = page.locator('.shop-section:has-text("Bulk Shop") ul.shop-checklist li span').first();
    await expect(firstBulkItem).toContainText('pumpkin seeds');
  });
});
