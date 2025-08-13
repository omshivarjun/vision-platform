import { test, expect } from '@playwright/test';

test.describe('Accessibility Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Login with accessibility demo user
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'visuallyimpaired@demo.local');
    await page.fill('input[type="password"]', 'access123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/accessibility');
  });

  test('should generate scene description', async ({ page }) => {
    // Navigate to accessibility features
    await page.click('text=Accessibility');
    
    // Click scene description button
    await page.click('button:has-text("Analyze Scene")');
    
    // Upload test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-scene.jpg');
    
    // Wait for scene analysis
    await page.waitForSelector('[data-testid="scene-description"]');
    
    // Verify scene description appears
    const description = await page.textContent('[data-testid="scene-description"]');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(10);
  });

  test('should detect objects in image', async ({ page }) => {
    // Navigate to accessibility features
    await page.click('text=Accessibility');
    
    // Click object detection button
    await page.click('button:has-text("Detect Objects")');
    
    // Upload test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-objects.jpg');
    
    // Wait for object detection
    await page.waitForSelector('[data-testid="detected-objects"]');
    
    // Verify objects are detected
    const objectsList = page.locator('[data-testid="detected-objects"] .object-tag');
    await expect(objectsList).toHaveCountGreaterThan(0);
  });

  test('should start voice commands', async ({ page }) => {
    // Navigate to accessibility features
    await page.click('text=Accessibility');
    
    // Click voice commands button
    await page.click('button:has-text("Start Listening")');
    
    // Verify voice command UI appears
    await expect(page.locator('[data-testid="voice-listening"]')).toBeVisible();
    
    // Stop listening
    await page.click('button:has-text("Stop Listening")');
    
    // Verify voice command UI disappears
    await expect(page.locator('[data-testid="voice-listening"]')).not.toBeVisible();
  });

  test('should adjust accessibility settings', async ({ page }) => {
    // Navigate to accessibility settings
    await page.click('text=Profile');
    await page.click('text=Settings');
    
    // Adjust voice speed
    const voiceSpeedSlider = page.locator('input[type="range"][name="voiceSpeed"]');
    await voiceSpeedSlider.fill('0.8');
    
    // Toggle high contrast
    await page.click('input[type="checkbox"][name="highContrast"]');
    
    // Toggle large text
    await page.click('input[type="checkbox"][name="largeText"]');
    
    // Save settings
    await page.click('button:has-text("Save Settings")');
    
    // Verify settings saved message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
  });

  test('should provide navigation assistance', async ({ page }) => {
    // Navigate to accessibility features
    await page.click('text=Accessibility');
    
    // Click navigation assistance
    await page.click('button:has-text("Start Navigation")');
    
    // Enter destination
    await page.fill('input[placeholder*="destination"]', 'Coffee Shop');
    
    // Start navigation
    await page.click('button:has-text("Get Directions")');
    
    // Wait for navigation instructions
    await page.waitForSelector('[data-testid="navigation-instructions"]');
    
    // Verify navigation instructions appear
    const instructions = await page.textContent('[data-testid="navigation-instructions"]');
    expect(instructions).toBeTruthy();
  });

  test('should read text aloud', async ({ page }) => {
    // Navigate to accessibility features
    await page.click('text=Accessibility');
    
    // Click OCR reader
    await page.click('button:has-text("Read Text")');
    
    // Upload text image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-text.jpg');
    
    // Wait for OCR processing
    await page.waitForSelector('[data-testid="ocr-text"]');
    
    // Click read aloud button
    await page.click('[data-testid="read-aloud"]');
    
    // Verify audio controls appear
    await expect(page.locator('[data-testid="audio-controls"]')).toBeVisible();
  });

  test('should work with keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify focus management
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should support screen reader attributes', async ({ page }) => {
    // Check for ARIA labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Each button should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }
  });
});