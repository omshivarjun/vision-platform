import request from 'supertest';
import app from '../src/index';

describe('OCR and TTS routes', () => {
  it('GET /readyz should respond with status json', async () => {
    const res = await request(app).get('/readyz');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
  });

  it('POST /api/tts without text should 400', async () => {
    const res = await request(app).post('/api/tts').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/ocr/extract without image should 400', async () => {
    const res = await request(app)
      .post('/api/ocr/extract')
      .set('Authorization', 'Bearer test')
      .field('language', 'en');
    expect([400, 401]).toContain(res.status);
  });
});
