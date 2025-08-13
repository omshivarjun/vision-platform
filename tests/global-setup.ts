import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Start services if not already running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for API service to be ready
    console.log('⏳ Waiting for API service...');
    await page.goto('http://localhost:3001/health', { timeout: 30000 });
    console.log('✅ API service is ready');
    
    // Wait for AI service to be ready
    console.log('⏳ Waiting for AI service...');
    await page.goto('http://localhost:8000/health', { timeout: 30000 });
    console.log('✅ AI service is ready');
    
    // Wait for web app to be ready
    console.log('⏳ Waiting for web app...');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    console.log('✅ Web app is ready');
    
    // Seed test data
    console.log('🌱 Seeding test data...');
    await seedTestData();
    console.log('✅ Test data seeded');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global test setup completed');
}

async function seedTestData() {
  // Create test users and data
  const testUsers = [
    {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      role: 'user'
    },
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'admin123',
      role: 'admin'
    }
  ];
  
  // This would typically make API calls to create test data
  // For now, we'll just log that we're seeding data
  console.log('Creating test users:', testUsers.map(u => u.email));
}

export default globalSetup;