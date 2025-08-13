import request from 'supertest';
import { app } from '../../services/api/src/index';
import { connectDatabase, disconnectDatabase } from '../../services/api/src/database/connection';
import { User } from '../../services/api/src/models/User';

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    
    // Create test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });
    
    authToken = response.body.data.token;
    userId = response.body.data.user.id;
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.token).toBeTruthy();
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeTruthy();
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('Translation API', () => {
    test('should translate text', async () => {
      const response = await request(app)
        .post('/api/translation/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Hello world',
          sourceLanguage: 'en',
          targetLanguage: 'es'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.translated_text).toBeTruthy();
    });

    test('should get supported languages', async () => {
      const response = await request(app)
        .get('/api/translation/languages');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.languages).toBeInstanceOf(Array);
      expect(response.body.data.languages.length).toBeGreaterThan(0);
    });

    test('should validate translation request', async () => {
      const response = await request(app)
        .post('/api/translation/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '', // Empty text should fail validation
          targetLanguage: 'es'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('OCR API', () => {
    test('should extract text from image', async () => {
      const response = await request(app)
        .post('/api/ocr/extract')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .field('language', 'en');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBeTruthy();
    });

    test('should handle batch OCR processing', async () => {
      const response = await request(app)
        .post('/api/ocr/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          images: [
            { url: 'http://example.com/image1.jpg', language: 'en' },
            { url: 'http://example.com/image2.jpg', language: 'es' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.batchId).toBeTruthy();
    });
  });

  describe('Accessibility API', () => {
    test('should generate scene description', async () => {
      const response = await request(app)
        .post('/api/accessibility/scene-description')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageUrl: 'http://example.com/scene.jpg',
          detailLevel: 'medium'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBeTruthy();
    });

    test('should detect objects in image', async () => {
      const response = await request(app)
        .post('/api/accessibility/object-detection')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageUrl: 'http://example.com/objects.jpg',
          confidenceThreshold: 0.5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.objects).toBeInstanceOf(Array);
    });

    test('should provide navigation assistance', async () => {
      const response = await request(app)
        .post('/api/accessibility/navigation')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentLocation: { latitude: 40.7128, longitude: -74.0060 },
          destination: 'Coffee Shop',
          accessibilityMode: 'walking'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.route).toBeTruthy();
    });
  });

  describe('User Management', () => {
    test('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          preferences: {
            language: 'es',
            theme: 'dark'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    test('should add glossary entry', async () => {
      const response = await request(app)
        .post('/api/users/glossary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceText: 'Hello',
          translatedText: 'Hola',
          sourceLang: 'en',
          targetLang: 'es',
          context: 'greeting'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should get translation history', async () => {
      const response = await request(app)
        .get('/api/users/translation-history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.history).toBeInstanceOf(Array);
    });
  });

  describe('File Management', () => {
    test('should upload file', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test file content'), 'test.txt')
        .field('type', 'document')
        .field('description', 'Test file');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.filename).toBeTruthy();
    });

    test('should list user files', async () => {
      const response = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.files).toBeInstanceOf(Array);
    });
  });

  describe('Health Checks', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should handle unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          name: '',
          password: '123' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeInstanceOf(Array);
    });
  });
});