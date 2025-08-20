const request = require('supertest');
const app = require('../../server'); // Adjust path as needed

describe('Health Check Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 OK for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 OK for API health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });
});


