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

  test('should keep logic when switching from blockly to code', async ({ page }) => {
    const toggleBtn = page.locator('#toggle-editor');
    const editor = page.locator('#editor');

    // Switch to Blockly mode
    await toggleBtn.click();

    // Add a block
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

    // Switch back to Code
    await toggleBtn.click();

    // Verify editor has the code
    const code = await editor.inputValue();
    expect(code).toContain('main() {');
    expect(code).toContain('set_led(1);');
  });

  test('should ask for confirmation if code is modified and switching to blocks', async ({ page }) => {
    const toggleBtn = page.locator('#toggle-editor');
    const editor = page.locator('#editor');

    // 1. Generate code from blocks first to set lastGeneratedCode
    await toggleBtn.click(); // Switch to Blocks
    await toggleBtn.click(); // Switch to Code (sets lastGeneratedCode)

    // 2. Modify code
    await editor.fill('main() { set_led(0); }');

    // 3. Try to switch back to Blocks
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('manual changes');
      await dialog.accept();
    });

    await toggleBtn.click();

    // Verify we are in blockly mode
    await expect(page.locator('#blockly-container')).toBeVisible();

    // Verify blocks were generated from the modified code
    const blockCount = await page.evaluate(() => {
        // @ts-ignore
        return Blockly.getMainWorkspace().getAllBlocks(false).length;
    });
    expect(blockCount).toBeGreaterThan(0);
  });

  test('should generate blocks from code', async ({ page }) => {
    const toggleBtn = page.locator('#toggle-editor');
    const editor = page.locator('#editor');

    const testCode = `
main() {
    set_led(1);
    delay(500);
    while (true) {
        set_led(0);
    }
}
`;
    await editor.fill(testCode);

    await toggleBtn.click(); // Switch to Blocks

    // Verify blocks were created
    const blocks = await page.evaluate(() => {
        // @ts-ignore
        const ws = Blockly.getMainWorkspace();
        return ws.getAllBlocks(false).map(b => b.type);
    });

    expect(blocks).toContain('pawn_main');
    expect(blocks).toContain('pawn_set_led');
    expect(blocks).toContain('pawn_delay');
    expect(blocks).toContain('controls_whileUntil');
  });
});
