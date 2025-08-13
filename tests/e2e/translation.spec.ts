import { test, expect } from '@playwright/test';

test.describe('Translation Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Login with demo user
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'user@demo.local');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/translator');
  });

  test('should translate text between languages', async ({ page }) => {
    // Navigate to translator
    await page.click('text=Translator');
    
    // Select source and target languages
    await page.selectOption('select[name="sourceLanguage"]', 'en');
    await page.selectOption('select[name="targetLanguage"]', 'es');
    
    // Enter text to translate
    const sourceText = 'Hello, how are you today?';
    await page.fill('textarea[placeholder*="Enter text"]', sourceText);
    
    // Click translate button
    await page.click('button:has-text("Translate")');
    
    // Wait for translation result
    await page.waitForSelector('[data-testid="translation-result"]');
    
    // Verify translation appears
    const translationResult = await page.textContent('[data-testid="translation-result"]');
    expect(translationResult).toBeTruthy();
    expect(translationResult).not.toBe(sourceText);
  });

  test('should swap languages', async ({ page }) => {
    // Navigate to translator
    await page.click('text=Translator');
    
    // Get initial language selections
    const initialSource = await page.inputValue('select[name="sourceLanguage"]');
    const initialTarget = await page.inputValue('select[name="targetLanguage"]');
    
    // Click swap button
    await page.click('[data-testid="swap-languages"]');
    
    // Verify languages are swapped
    const newSource = await page.inputValue('select[name="sourceLanguage"]');
    const newTarget = await page.inputValue('select[name="targetLanguage"]');
    
    expect(newSource).toBe(initialTarget);
    expect(newTarget).toBe(initialSource);
  });

  test('should handle voice input', async ({ page }) => {
    // Navigate to translator
    await page.click('text=Translator');
    
    // Click voice input button
    await page.click('[data-testid="voice-input"]');
    
    // Verify voice recording UI appears
    await expect(page.locator('[data-testid="voice-recording"]')).toBeVisible();
    
    // Stop recording
    await page.click('[data-testid="stop-recording"]');
    
    // Verify recording stopped
    await expect(page.locator('[data-testid="voice-recording"]')).not.toBeVisible();
  });

  test('should upload and translate image', async ({ page }) => {
    // Navigate to translator
    await page.click('text=Translator');
    
    // Click image upload button
    await page.click('[data-testid="image-upload"]');
    
    // Upload test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-text-image.jpg');
    
    // Wait for OCR processing
    await page.waitForSelector('[data-testid="ocr-result"]');
    
    // Verify OCR text appears
    const ocrText = await page.textContent('[data-testid="ocr-result"]');
    expect(ocrText).toBeTruthy();
  });

  test('should save translation to history', async ({ page }) => {
    // Navigate to translator
    await page.click('text=Translator');
    
    // Perform a translation
    await page.fill('textarea[placeholder*="Enter text"]', 'Hello world');
    await page.click('button:has-text("Translate")');
    
    // Wait for translation
    await page.waitForSelector('[data-testid="translation-result"]');
    
    // Navigate to profile/history
    await page.click('text=Profile');
    await page.click('text=Translation History');
    
    // Verify translation appears in history
    await expect(page.locator('text=Hello world')).toBeVisible();
  });

  test('should add term to glossary', async ({ page }) => {
    // Navigate to profile
    await page.click('text=Profile');
    await page.click('text=Personal Glossary');
    
    // Click add term button
    await page.click('button:has-text("Add Term")');
    
    // Fill in glossary form
    await page.fill('input[name="term"]', 'API');
    await page.fill('input[name="definition"]', 'Application Programming Interface');
    await page.selectOption('select[name="language"]', 'en');
    
    // Save term
    await page.click('button:has-text("Save")');
    
    // Verify term appears in glossary
    await expect(page.locator('text=API')).toBeVisible();
    await expect(page.locator('text=Application Programming Interface')).toBeVisible();
  });
});