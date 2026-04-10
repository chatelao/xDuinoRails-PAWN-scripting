import { test, expect } from '@playwright/test';

test.describe('PAWN Online Compiler', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the page and initialize the compiler', async ({ page }) => {
    await expect(page).toHaveTitle(/PAWN Online Compiler/);
    const compileBtn = page.locator('#compile-btn');
    await expect(compileBtn).toBeEnabled({ timeout: 10000 });
    await expect(compileBtn).toHaveText('Compile');

    const consoleArea = page.locator('#console');
    await expect(consoleArea).toContainText('PAWN Compiler Ready.');
  });

  test('should successfully compile valid PAWN code', async ({ page }) => {
    // Wait for compiler to be ready
    const compileBtn = page.locator('#compile-btn');
    await expect(compileBtn).toBeEnabled({ timeout: 10000 });

    // Click compile
    await compileBtn.click();

    const consoleArea = page.locator('#console');
    await expect(consoleArea).toContainText('Compiling...');
    await expect(consoleArea).toContainText('Compiler returned: 0', { timeout: 10000 });
    await expect(consoleArea).toContainText('Success! .amx file generated.');

    const downloadLink = page.locator('#download-link');
    await expect(downloadLink).toBeVisible();
  });

  test('should show error for invalid PAWN code', async ({ page }) => {
    // Wait for compiler to be ready
    const compileBtn = page.locator('#compile-btn');
    await expect(compileBtn).toBeEnabled({ timeout: 10000 });

    // Set invalid code in editor
    await page.fill('#editor', 'invalid code');

    // Click compile
    await compileBtn.click();

    const consoleArea = page.locator('#console');
    await expect(consoleArea).toContainText('Compiling...');
    // PAWN compiler returns non-zero on error
    await expect(consoleArea).toContainText('Compilation failed.');

    const downloadLink = page.locator('#download-link');
    await expect(downloadLink).not.toBeVisible();
  });
});
