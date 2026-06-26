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

  test('should verify adding a custom recipe via the Add Recipe panel', async ({ page }) => {
    const offlineBtn = page.getByRole('button', { name: 'Run in Offline Fallback Mode' });
    await expect(offlineBtn).toBeVisible({ timeout: 10000 });
    await offlineBtn.click();

    // Navigate to Add Recipe tab
    await page.getByRole('button', { name: 'Add Recipe' }).click();

    // Add Recipe section should be active
    const addRecipeSection = page.locator('#add-recipe');
    await expect(addRecipeSection).toHaveClass(/active/);

    // Fill out the custom recipe form
    await page.locator('#panel-title').fill('Adelaide Lentil Power Salad');
    await page.locator('#panel-intro').fill('A high-fiber and protein packed salad');
    await page.locator('#panel-ingredients').fill('150g cooked lentils\n50g baby spinach\n1 tbsp olive oil');
    await page.locator('#panel-instructions').fill('Rinse the lentils\nToss with spinach\nDrizzle with olive oil');
    await page.locator('#panel-calories').fill('380');
    await page.locator('#panel-carbs').fill('40');
    await page.locator('#panel-gi').fill('30');

    // Submit the form
    await page.getByRole('button', { name: 'Save Recipe' }).click();

    // Verification: Active tab should redirect to Recipe Hub
    const recipeTab = page.locator('#recipes');
    await expect(recipeTab).toHaveClass(/active/);

    // Filter or search for our custom recipe
    await page.locator('#recipe-search').fill('Adelaide Lentil Power Salad');

    // The newly created recipe card should be visible
    const recipeCards = page.locator('.recipe-card');
    await expect(recipeCards).toHaveCount(1);
    const cardTitle = recipeCards.locator('h3').first();
    await expect(cardTitle).toHaveText('Adelaide Lentil Power Salad');
  });

  test('should plan snack slots and aggregate repeated meals into the shopping list', async ({ page }) => {
    const offlineBtn = page.getByRole('button', { name: 'Run in Offline Fallback Mode' });
    await expect(offlineBtn).toBeVisible({ timeout: 10000 });
    await offlineBtn.click();

    await page.getByRole('button', { name: 'Weekly Planner' }).click();
    const monday = page.locator('.planner-day-card').first();
    await expect(monday.locator('.planner-meal-slot')).toHaveCount(6);
    await expect(monday.locator('.planner-day-total')).toContainText('0 kcal');
    await monday.locator('.planner-snack-slots summary').click();
    await expect(monday.getByText('Mid-morning snack', { exact: true })).toBeVisible();
    await expect(monday.getByText('Afternoon snack', { exact: true })).toBeVisible();
    await expect(monday.getByText('Evening snack', { exact: true })).toBeVisible();

    await monday.locator('.planner-meal-slot').first().locator('select').selectOption('parfait');
    await monday.locator('.planner-snack-slots .planner-meal-slot').first().locator('select').selectOption('parfait');
    await expect(monday.locator('.planner-day-total')).toContainText('1200 kcal');

    await page.getByRole('button', { name: 'Aggregate to Shopping List' }).click();
    await page.getByRole('button', { name: 'Plan Summary' }).click();

    await expect(page.locator('#summary')).toContainText('Mid-morning snack');
    await expect(page.locator('#summary')).toContainText('1200 kcal');

    await page.getByRole('button', { name: 'Shopping List', exact: true }).click();
    const plannerOats = page.locator('.shop-checklist').filter({ hasText: 'rolled or steel-cut oats' });
    await expect(plannerOats).toContainText('80 g');
  });
});
