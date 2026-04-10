import { test, expect } from '@playwright/test';

test.describe('Blockly Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle between code and blockly mode', async ({ page }) => {
    const toggleBtn = page.locator('#toggle-editor');
    const editorContainer = page.locator('#editor-container');
    const blocklyContainer = page.locator('#blockly-container');

    await expect(editorContainer).toBeVisible();
    await expect(blocklyContainer).not.toBeVisible();

    await toggleBtn.click();
    await expect(toggleBtn).toHaveText('Switch to Code');
    await expect(editorContainer).not.toBeVisible();
    await expect(blocklyContainer).toBeVisible();

    await toggleBtn.click();
    await expect(toggleBtn).toHaveText('Switch to Blocks');
    await expect(editorContainer).toBeVisible();
    await expect(blocklyContainer).not.toBeVisible();
  });

  test('should generate and compile code from blockly', async ({ page }) => {
    const toggleBtn = page.locator('#toggle-editor');
    const compileBtn = page.locator('#compile-btn');
    const consoleArea = page.locator('#console');

    // Wait for compiler to be ready
    await expect(compileBtn).toBeEnabled({ timeout: 10000 });

    // Switch to Blockly mode
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText('Switch to Code');
    await expect(page.locator('#blockly-container')).toBeVisible();

    // Use evaluate to add blocks to workspace programmatically
    await page.evaluate(() => {
        // @ts-ignore
        const ws = Blockly.getMainWorkspace();
        ws.clear();
        // @ts-ignore
        const mainBlock = ws.newBlock('pawn_main');
        mainBlock.initSvg();
        mainBlock.render();

        // @ts-ignore
        const ledBlock = ws.newBlock('pawn_set_led');
        ledBlock.setFieldValue('1', 'STATUS');
        ledBlock.initSvg();
        ledBlock.render();

        const connection = mainBlock.getInput('STACK').connection;
        connection.connect(ledBlock.previousConnection);
    });

    // Click compile
    await compileBtn.click();

    // Verify generated code and compilation
    await expect(consoleArea).toContainText('Generated Code:');
    await expect(consoleArea).toContainText('main() {');
    await expect(consoleArea).toContainText('set_led(1);');
    await expect(consoleArea).toContainText('Compiling...');
    await expect(consoleArea).toContainText('Compiler returned: 0', { timeout: 10000 });
    await expect(consoleArea).toContainText('Success! .amx file generated.');
  });
});
